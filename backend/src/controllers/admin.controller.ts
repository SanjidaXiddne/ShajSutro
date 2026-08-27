import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import ContactMessage from "../models/ContactMessage";
import User from "../models/User";
import Order from "../models/Order";
import Product from "../models/Product";
import Category from "../models/Category";
import JobApplication from "../models/JobApplication";
import Subscriber from "../models/Subscriber";
import { AppError } from "../middleware/error.middleware";
import { sendBroadcastEmail } from "../services/emailService";
import { AuthRequest, ICategoryDocument } from "../types";

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────

export const getDashboardStats = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfThisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfLastWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalOrders,
      totalProducts,
      revenueResult,
      ordersByStatus,
      recentOrders,
      revenueByDay,
      topSellingProducts,
      lowStockProducts,
      thisMonthRevResult,
      lastMonthRevResult,
      thisWeekRevResult,
      lastWeekRevResult,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { status: { $nin: ["cancelled", "returned"] } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email"),
      Order.aggregate([
        {
          $match: {
            status: { $nin: ["cancelled", "returned"] },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            revenue: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: "$_id", revenue: 1, _id: 0 } },
      ]),
      // Top selling products
      Order.aggregate([
        { $match: { status: { $nin: ["cancelled", "returned"] } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            name: { $first: "$items.name" },
            image: { $first: "$items.image" },
            price: { $first: "$items.price" },
            totalSold: { $sum: "$items.quantity" },
            totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
      // Low stock products (stock <= 5)
      Product.find({ stock: { $lte: 5 } })
        .select("name images price stock category")
        .sort({ stock: 1 })
        .limit(5),
      // This Month Revenue
      Order.aggregate([
        { $match: { status: { $nin: ["cancelled", "returned"] }, createdAt: { $gte: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      // Last Month Revenue
      Order.aggregate([
        { $match: { status: { $nin: ["cancelled", "returned"] }, createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      // This Week Revenue
      Order.aggregate([
        { $match: { status: { $nin: ["cancelled", "returned"] }, createdAt: { $gte: startOfThisWeek } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      // Last Week Revenue
      Order.aggregate([
        { $match: { status: { $nin: ["cancelled", "returned"] }, createdAt: { $gte: startOfLastWeek, $lt: startOfThisWeek } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    const totalRevenue: number = (revenueResult[0] as { total?: number } | undefined)?.total ?? 0;

    const thisMonthRevenue = (thisMonthRevResult[0] as { total?: number } | undefined)?.total ?? 0;
    const lastMonthRevenue = (lastMonthRevResult[0] as { total?: number } | undefined)?.total ?? 0;
    const monthlyGrowth = lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : (thisMonthRevenue > 0 ? 100 : 0);

    const thisWeekRevenue = (thisWeekRevResult[0] as { total?: number } | undefined)?.total ?? 0;
    const lastWeekRevenue = (lastWeekRevResult[0] as { total?: number } | undefined)?.total ?? 0;
    const weeklyGrowth = lastWeekRevenue > 0
      ? Math.round(((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100)
      : (thisWeekRevenue > 0 ? 100 : 0);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue,
        ordersByStatus,
        recentOrders,
        revenueByDay,
        topSellingProducts,
        lowStockProducts,
        growthMetrics: {
          thisMonthRevenue,
          lastMonthRevenue,
          monthlyGrowth,
          thisWeekRevenue,
          lastWeekRevenue,
          weeklyGrowth,
        },
      },
    });
  }
);

// ─── GET /api/admin/products ──────────────────────────────────────────────────
// Returns ALL products (including hidden) for admin management

export const getAdminProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt((req.query.page as string) ?? "1"));
    const limit = Math.min(50, parseInt((req.query.limit as string) ?? "12"));
    const skip = (page - 1) * limit;
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;

    const filter: Record<string, unknown> = {};
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        const childCats = await Category.find({ parent: category });
        if (childCats.length > 0) {
          filter.category = {
            $in: [
              new mongoose.Types.ObjectId(category),
              ...childCats.map((c: ICategoryDocument) => c._id),
            ],
          };
        } else {
          filter.category = new mongoose.Types.ObjectId(category);
        }
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) {
          const childCats = await Category.find({ parent: cat._id });
          if (childCats.length > 0) {
            filter.category = {
              $in: [cat._id, ...childCats.map((c: ICategoryDocument) => c._id)],
            };
          } else {
            filter.category = cat._id;
          }
        } else {
          filter.category = category;
        }
      }
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (req.query.isFeatured !== undefined) {
      filter.isFeatured = req.query.isFeatured === "true";
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate({
          path: "category",
          select: "name slug parent",
          populate: { path: "parent", select: "name slug" },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }
);

// ─── GET /api/admin/users ─────────────────────────────────────────────────────

export const getAllUsers = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt((req.query.page as string) ?? "1"));
    const limit = Math.min(50, parseInt((req.query.limit as string) ?? "20"));
    const skip = (page - 1) * limit;
    const search = req.query.search as string | undefined;

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }
);

// ─── GET /api/admin/users/:id ──────────────────────────────────────────────────

export const getUserDetails = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError("User not found", 404);

    const userOrders = await Order.find({ user: user._id }).sort({ createdAt: -1 });

    const statusCounts: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
    };

    let totalSpent = 0;
    userOrders.forEach((o) => {
      if (statusCounts[o.status] !== undefined) {
        statusCounts[o.status]++;
      }
      if (o.status !== "cancelled" && o.status !== "returned" && o.paymentStatus !== "refunded") {
        totalSpent += o.total;
      }
    });

    const recentOrders = userOrders.slice(0, 10).map((o) => {
      let paymentStatus = o.paymentStatus;
      if (o.status === "returned" || o.paymentStatus === "refunded") {
        paymentStatus = "refunded";
      } else if (o.status === "cancelled") {
        paymentStatus = "cancelled";
      }

      return {
        _id: o._id,
        total: o.total,
        status: o.status,
        paymentStatus,
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt,
        itemsCount: o.items ? o.items.length : 0,
      };
    });

    // Collect all unique addresses & phone numbers from user profile AND order history
    const allAddresses: Array<{
      label?: string;
      phone?: string;
      address: string;
      city?: string;
      state?: string;
      zip?: string;
    }> = [];

    let primaryPhone = user.phone || "";

    if (user.addresses && user.addresses.length > 0) {
      user.addresses.forEach((addr) => {
        if (addr.phone && !primaryPhone) primaryPhone = addr.phone;
        allAddresses.push({
          label: addr.label || "Saved Address",
          phone: addr.phone || user.phone,
          address: addr.address,
          city: addr.city,
          zip: addr.zip,
        });
      });
    }

    userOrders.forEach((o) => {
      if (o.shippingAddress && o.shippingAddress.address) {
        const addrText = o.shippingAddress.address;
        const phone = o.shippingAddress.phone;
        const city = o.shippingAddress.city;
        const state = o.shippingAddress.state;
        const zip = o.shippingAddress.zip;

        if (phone && !primaryPhone) {
          primaryPhone = phone;
        }

        const exists = allAddresses.some(
          (a) => a.address.toLowerCase() === addrText.toLowerCase()
        );

        if (!exists) {
          const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
          allAddresses.push({
            label: `Order Address ${dateStr ? `(${dateStr})` : ""}`,
            phone,
            address: addrText,
            city,
            state,
            zip,
          });
        }
      }
    });

    const userObj = user.toObject();
    if (primaryPhone) {
      userObj.phone = primaryPhone;
    }

    res.status(200).json({
      success: true,
      data: {
        user: userObj,
        addresses: allAddresses,
        stats: {
          totalOrders: userOrders.length,
          totalSpent,
          statusCounts,
        },
        recentOrders,
      },
    });
  }
);

// ─── POST /api/admin/users ────────────────────────────────────────────────────

export const createUser = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const { name, email, password, role } = _req.body as {
      name: string;
      email: string;
      password: string;
      role?: "user" | "admin" | "sub-admin";
    };

    if (!name || !email || !password) {
      throw new AppError("Name, email, and password are required", 400);
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) throw new AppError("A user with this email already exists", 409);

    const user = await User.create({
      name,
      email,
      password,
      role: role ?? "user",
      adminRole: role === "sub-admin" ? "sub_admin" : "root_admin",
    });

    res.status(201).json({
      success: true,
      message: "User created",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
        createdAt: user.createdAt,
      },
    });
  }
);

// ─── PUT /api/admin/users/:id ─────────────────────────────────────────────────

export const updateUser = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { role, name } = req.body as { role?: "user" | "admin" | "sub-admin"; name?: string };

    if (req.user?._id.toString() === req.params.id && role === "user") {
      throw new AppError("You cannot demote your own admin account", 400);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, name },
      { new: true, runValidators: true }
    );

    if (!user) throw new AppError("User not found", 404);

    res.status(200).json({
      success: true,
      message: "User updated",
      data: user,
    });
  }
);

// ─── PUT /api/admin/users/:id/block ──────────────────────────────────────────

export const blockUser = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (req.user?._id.toString() === req.params.id) {
      throw new AppError("You cannot block your own account", 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) throw new AppError("User not found", 404);

    if (user.role === "admin") {
      throw new AppError("Admin accounts cannot be blocked", 400);
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isBlocked ? "User blocked" : "User unblocked",
      data: user,
    });
  }
);

// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────────

export const deleteUser = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (req.user?._id.toString() === req.params.id) {
      throw new AppError("You cannot delete your own account", 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) throw new AppError("User not found", 404);

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted",
    });
  }
);

// ─── GET /api/admin/orders ────────────────────────────────────────────────────

export const getAllOrders = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt((req.query.page as string) ?? "1"));
    const limit = Math.min(50, parseInt((req.query.limit as string) ?? "10"));
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      filter.createdAt = dateFilter;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email"),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }
);

// ─── GET /api/admin/orders/:id ────────────────────────────────────────────────

export const getOrderDetails = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order) throw new AppError("Order not found", 404);

    res.status(200).json({
      success: true,
      data: order,
    });
  }
);

// ─── PUT /api/admin/orders/:id/status ────────────────────────────────────────

export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { status } = req.body as {
      status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returned";
    };

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled", "returned"];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400);
    }

    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError("Order not found", 404);

    if (order.status !== status) {
      order.status = status;
      if (status === "delivered") {
        order.paymentStatus = "paid";
      }
      if ((status === "cancelled" || status === "returned") && order.paymentStatus === "paid") {
        order.paymentStatus = "refunded";
      }
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status,
        updatedAt: new Date(),
        note: status === "delivered"
          ? "Order delivered and payment marked as Paid"
          : (status === "cancelled" || status === "returned") && order.paymentStatus === "refunded"
          ? `Status updated to ${status} and payment refunded`
          : `Status updated to ${status}`,
      } as any);
      await order.save();
    }
    await order.populate("user", "name email");

    res.status(200).json({
      success: true,
      message: `Order status updated to '${status}'`,
      data: order,
    });
  }
);

// ─── PUT /api/admin/orders/:id/exchange — handle exchange request ────────────

export const updateExchangeStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { status, adminNote, markAsReturned } = req.body as {
      status: "approved" | "rejected" | "completed";
      adminNote?: string;
      markAsReturned?: boolean;
    };

    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError("Order not found", 404);

    if (!order.exchangeRequest) {
      throw new AppError("No exchange request found for this order", 400);
    }

    order.exchangeRequest.status = status;
    if (adminNote !== undefined) order.exchangeRequest.adminNote = adminNote;

    if (markAsReturned || status === "completed") {
      order.status = "returned";
      if (order.paymentStatus === "paid") {
        order.paymentStatus = "refunded";
      }
    }

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: order.status,
      updatedAt: new Date(),
      note: `Exchange request ${status}${adminNote ? `: ${adminNote}` : ""}`,
    } as any);

    await order.save();

    res.status(200).json({
      success: true,
      message: `Exchange request ${status}`,
      data: order,
    });
  }
);

// ─── PUT /api/admin/orders/:id/confirm-payment ────────────────────────────────

export const confirmPayment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) throw new AppError("Order not found", 404);

    if (order.paymentStatus === "paid") {
      throw new AppError("Payment is already confirmed", 400);
    }

    order.paymentStatus = "paid";
    // Also move status to confirmed when payment verified
    if (order.status === "pending") {
      order.status = "confirmed";
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: "confirmed",
        updatedAt: new Date(),
        note: "Payment confirmed",
      } as any);
    }
    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
      data: order,
    });
  }
);

// ─── PUT /api/admin/orders/:id/refund-payment ─────────────────────────────────

export const refundPayment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) throw new AppError("Order not found", 404);

    order.paymentStatus = "refunded";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment marked as Refunded",
      data: order,
    });
  }
);

// ─── GET /api/admin/messages ─────────────────────────────────────────────────

export const getAllContactMessages = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt((req.query.page as string) ?? "1"));
    const limit = Math.min(100, parseInt((req.query.limit as string) ?? "20"));
    const skip = (page - 1) * limit;
    const isRead = req.query.isRead as string | undefined;

    const filter: Record<string, unknown> = {};
    if (isRead === "true" || isRead === "false") {
      filter.isRead = isRead === "true";
    }

    const [messages, total, unreadCount] = await Promise.all([
      ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ContactMessage.countDocuments(filter),
      ContactMessage.countDocuments({ isRead: false }),
    ]);

    res.status(200).json({
      success: true,
      data: messages,
      meta: { unreadCount },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  },
);

// ─── PUT /api/admin/messages/:id/read ────────────────────────────────────────

export const markContactMessageRead = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true },
    );

    if (!message) throw new AppError("Message not found", 404);

    res.status(200).json({
      success: true,
      message: "Message marked as read",
      data: message,
    });
  },
);

// ─── GET /api/admin/activity-alerts ──────────────────────────────────────────
// Returns real-time system notifications for Admin Header (new orders, users, messages, applications)

export const getAdminActivityAlerts = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const [recentOrders, recentUsers, recentMessages, recentApplications] =
      await Promise.all([
        Order.find()
          .sort({ createdAt: -1 })
          .limit(8)
          .populate("user", "name email"),
        User.find({ role: "user" }).sort({ createdAt: -1 }).limit(8),
        ContactMessage.find().sort({ createdAt: -1 }).limit(8),
        JobApplication.find()
          .sort({ createdAt: -1 })
          .limit(8)
          .populate("job", "title"),
      ]);

    const orderAlerts = recentOrders.map((o) => {
      const u = o.user as { name?: string; email?: string } | null;
      return {
        id: `order_${o._id}`,
        type: "order",
        title: "New Order Placed",
        message: `${u?.name || "A customer"} placed an order of ৳${o.total}`,
        link: "/admin/orders",
        createdAt: o.createdAt ?? new Date(),
        badge: {
          icon: "🛍️",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          text: "Order",
        },
      };
    });

    const userAlerts = recentUsers.map((u) => ({
      id: `user_${u._id}`,
      type: "user",
      title: "New Account Created",
      message: `${u.name} registered a new user account (${u.email})`,
      link: "/admin/users",
      createdAt: u.createdAt ?? new Date(),
      badge: {
        icon: "👤",
        bg: "bg-cyan-50 text-cyan-700 border-cyan-200",
        text: "New User",
      },
    }));

    const messageAlerts = recentMessages.map((m) => ({
      id: `msg_${m._id}`,
      type: "message",
      title: "New Customer Message",
      message: `From ${m.name}: "${m.subject || m.message.slice(0, 35)}..."`,
      link: "/admin/messages",
      createdAt: m.createdAt ?? new Date(),
      badge: {
        icon: "💬",
        bg: "bg-purple-50 text-purple-700 border-purple-200",
        text: "Message",
      },
    }));

    const applicationAlerts = recentApplications.map((a) => {
      const j = a.job as { title?: string } | null;
      return {
        id: `app_${a._id}`,
        type: "application",
        title: "New Job Application",
        message: `${a.name} submitted an application for ${j?.title || "Job"}`,
        link: "/admin/applications",
        createdAt: a.createdAt ?? new Date(),
        badge: {
          icon: "📄",
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          text: "Application",
        },
      };
    });

    const combined = [
      ...orderAlerts,
      ...userAlerts,
      ...messageAlerts,
      ...applicationAlerts,
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const alerts = combined.slice(0, 15);

    // Count alerts created in the last 24 hours as new
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const unreadCount = alerts.filter(
      (a) => new Date(a.createdAt).getTime() > oneDayAgo,
    ).length;

    res.status(200).json({
      success: true,
      data: alerts,
      meta: { unreadCount },
    });
  },
);

// ─── GET /api/admin/team ──────────────────────────────────────────────────────

export const getAllAdminUsers = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const adminUsers = await User.find({ role: "admin" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: adminUsers,
    });
  },
);

// ─── PUT /api/admin/users/:id/permissions ─────────────────────────────────────

export const updateAdminPermissions = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { adminRole, permissions } = req.body;

    const currentAdmin = req.user;
    if (currentAdmin?.adminRole === "sub_admin") {
      throw new AppError(
        "Only Root Admin can assign permissions to team members",
        403,
      );
    }

    const targetUser = await User.findById(id);
    if (!targetUser) throw new AppError("User not found", 404);

    if (adminRole && ["root_admin", "sub_admin"].includes(adminRole)) {
      targetUser.adminRole = adminRole;
      if (adminRole === "root_admin") {
        targetUser.role = "admin";
      }
    }

    if (permissions && typeof permissions === "object") {
      targetUser.permissions = {
        ...targetUser.permissions,
        ...permissions,
      };
    }

    await targetUser.save();

    res.status(200).json({
      success: true,
      message: "Admin role and permissions updated successfully",
      data: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        adminRole: targetUser.adminRole,
        permissions: targetUser.permissions,
      },
    });
  },
);

// ─── GET /api/admin/subscribers ───────────────────────────────────────────────

export const getSubscribers = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt((req.query.page as string) ?? "1"));
    const limit = Math.min(100, parseInt((req.query.limit as string) ?? "20"));
    const search = ((req.query.search as string) ?? "").trim();
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.email = { $regex: search, $options: "i" };
    }

    const [subscribers, total, activeCount] = await Promise.all([
      Subscriber.find(filter)
        .sort({ subscribedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Subscriber.countDocuments(filter),
      Subscriber.countDocuments({ isActive: true }),
    ]);

    res.status(200).json({
      success: true,
      data: subscribers,
      meta: {
        total,
        activeCount,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  }
);

// ─── DELETE /api/admin/subscribers/:id ────────────────────────────────────────

export const deleteSubscriber = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) {
      throw new AppError("Subscriber not found", 404);
    }
    res.status(200).json({
      success: true,
      message: "Subscriber removed successfully",
    });
  }
);

// ─── PATCH /api/admin/subscribers/:id/toggle ─────────────────────────────────

export const toggleSubscriberStatus = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const subscriber = await Subscriber.findById(req.params.id);
    if (!subscriber) {
      throw new AppError("Subscriber not found", 404);
    }

    subscriber.isActive = !subscriber.isActive;
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: `Subscriber marked as ${subscriber.isActive ? "Active" : "Inactive"}`,
      data: subscriber,
    });
  }
);

// ─── POST /api/admin/subscribers/broadcast ─────────────────────────────────────

export const broadcastSubscribersEmail = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const {
      subject,
      title,
      messageBody,
      badgeText,
      bannerImageUrl,
      ctaButtonText,
      ctaButtonUrl,
      target = "active",
    } = req.body as {
      subject: string;
      title: string;
      messageBody: string;
      badgeText?: string;
      bannerImageUrl?: string;
      ctaButtonText?: string;
      ctaButtonUrl?: string;
      target?: "active" | "all";
    };

    if (!subject || !subject.trim()) {
      throw new AppError("Email subject is required", 400);
    }
    if (!title || !title.trim()) {
      throw new AppError("Email headline/title is required", 400);
    }
    if (!messageBody || !messageBody.trim()) {
      throw new AppError("Email message body is required", 400);
    }

    const filter: any = {};
    if (target === "active") {
      filter.isActive = true;
    }

    const subscribers = await Subscriber.find(filter).select("email");
    if (!subscribers || subscribers.length === 0) {
      throw new AppError("No subscribers found matching target criteria", 404);
    }

    const recipientEmails = subscribers.map((s) => s.email);

    // Call broadcast service
    const result = await sendBroadcastEmail({
      recipientEmails,
      subject: subject.trim(),
      title: title.trim(),
      messageBody: messageBody.trim(),
      badgeText: badgeText?.trim(),
      bannerImageUrl: bannerImageUrl?.trim(),
      ctaButtonText: ctaButtonText?.trim(),
      ctaButtonUrl: ctaButtonUrl?.trim(),
    });

    res.status(200).json({
      success: true,
      message: `Broadcast mail completed. Sent: ${result.sentCount}, Failed: ${result.failedCount}`,
      data: {
        totalTargeted: recipientEmails.length,
        sentCount: result.sentCount,
        failedCount: result.failedCount,
      },
    });
  }
);
