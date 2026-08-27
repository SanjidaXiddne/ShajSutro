"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastSubscribersEmail = exports.toggleSubscriberStatus = exports.deleteSubscriber = exports.getSubscribers = exports.updateAdminPermissions = exports.getAllAdminUsers = exports.getAdminActivityAlerts = exports.markContactMessageRead = exports.getAllContactMessages = exports.refundPayment = exports.confirmPayment = exports.updateExchangeStatus = exports.updateOrderStatus = exports.getOrderDetails = exports.getAllOrders = exports.deleteUser = exports.blockUser = exports.updateUser = exports.createUser = exports.getUserDetails = exports.getAllUsers = exports.getAdminProducts = exports.getDashboardStats = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ContactMessage_1 = __importDefault(require("../models/ContactMessage"));
const User_1 = __importDefault(require("../models/User"));
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const JobApplication_1 = __importDefault(require("../models/JobApplication"));
const Subscriber_1 = __importDefault(require("../models/Subscriber"));
const error_middleware_1 = require("../middleware/error.middleware");
const emailService_1 = require("../services/emailService");
// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
exports.getDashboardStats = (0, express_async_handler_1.default)(async (_req, res) => {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfThisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfLastWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const [totalUsers, totalOrders, totalProducts, revenueResult, ordersByStatus, recentOrders, revenueByDay, topSellingProducts, lowStockProducts, thisMonthRevResult, lastMonthRevResult, thisWeekRevResult, lastWeekRevResult,] = await Promise.all([
        User_1.default.countDocuments({ role: "user" }),
        Order_1.default.countDocuments(),
        Product_1.default.countDocuments(),
        Order_1.default.aggregate([
            { $match: { status: { $nin: ["cancelled", "returned"] } } },
            { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
        Order_1.default.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Order_1.default.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("user", "name email"),
        Order_1.default.aggregate([
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
        Order_1.default.aggregate([
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
        Product_1.default.find({ stock: { $lte: 5 } })
            .select("name images price stock category")
            .sort({ stock: 1 })
            .limit(5),
        // This Month Revenue
        Order_1.default.aggregate([
            { $match: { status: { $nin: ["cancelled", "returned"] }, createdAt: { $gte: startOfThisMonth } } },
            { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
        // Last Month Revenue
        Order_1.default.aggregate([
            { $match: { status: { $nin: ["cancelled", "returned"] }, createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } } },
            { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
        // This Week Revenue
        Order_1.default.aggregate([
            { $match: { status: { $nin: ["cancelled", "returned"] }, createdAt: { $gte: startOfThisWeek } } },
            { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
        // Last Week Revenue
        Order_1.default.aggregate([
            { $match: { status: { $nin: ["cancelled", "returned"] }, createdAt: { $gte: startOfLastWeek, $lt: startOfThisWeek } } },
            { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
    ]);
    const totalRevenue = revenueResult[0]?.total ?? 0;
    const thisMonthRevenue = thisMonthRevResult[0]?.total ?? 0;
    const lastMonthRevenue = lastMonthRevResult[0]?.total ?? 0;
    const monthlyGrowth = lastMonthRevenue > 0
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : (thisMonthRevenue > 0 ? 100 : 0);
    const thisWeekRevenue = thisWeekRevResult[0]?.total ?? 0;
    const lastWeekRevenue = lastWeekRevResult[0]?.total ?? 0;
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
});
// ─── GET /api/admin/products ──────────────────────────────────────────────────
// Returns ALL products (including hidden) for admin management
exports.getAdminProducts = (0, express_async_handler_1.default)(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page ?? "1"));
    const limit = Math.min(50, parseInt(req.query.limit ?? "12"));
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const category = req.query.category;
    const filter = {};
    if (category)
        filter.category = category;
    if (search)
        filter.$text = { $search: search };
    const [products, total] = await Promise.all([
        Product_1.default.find(filter)
            .populate("category", "name slug")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Product_1.default.countDocuments(filter),
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
});
// ─── GET /api/admin/users ─────────────────────────────────────────────────────
exports.getAllUsers = (0, express_async_handler_1.default)(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page ?? "1"));
    const limit = Math.min(50, parseInt(req.query.limit ?? "20"));
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const filter = {};
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }
    const [users, total] = await Promise.all([
        User_1.default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User_1.default.countDocuments(filter),
    ]);
    res.status(200).json({
        success: true,
        data: users,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});
// ─── GET /api/admin/users/:id ──────────────────────────────────────────────────
exports.getUserDetails = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await User_1.default.findById(req.params.id);
    if (!user)
        throw new error_middleware_1.AppError("User not found", 404);
    const userOrders = await Order_1.default.find({ user: user._id }).sort({ createdAt: -1 });
    const statusCounts = {
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
        }
        else if (o.status === "cancelled") {
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
    const allAddresses = [];
    let primaryPhone = user.phone || "";
    if (user.addresses && user.addresses.length > 0) {
        user.addresses.forEach((addr) => {
            if (addr.phone && !primaryPhone)
                primaryPhone = addr.phone;
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
            const exists = allAddresses.some((a) => a.address.toLowerCase() === addrText.toLowerCase());
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
});
// ─── POST /api/admin/users ────────────────────────────────────────────────────
exports.createUser = (0, express_async_handler_1.default)(async (_req, res) => {
    const { name, email, password, role } = _req.body;
    if (!name || !email || !password) {
        throw new error_middleware_1.AppError("Name, email, and password are required", 400);
    }
    const exists = await User_1.default.findOne({ email: email.toLowerCase() });
    if (exists)
        throw new error_middleware_1.AppError("A user with this email already exists", 409);
    const user = await User_1.default.create({
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
});
// ─── PUT /api/admin/users/:id ─────────────────────────────────────────────────
exports.updateUser = (0, express_async_handler_1.default)(async (req, res) => {
    const { role, name } = req.body;
    if (req.user?._id.toString() === req.params.id && role === "user") {
        throw new error_middleware_1.AppError("You cannot demote your own admin account", 400);
    }
    const user = await User_1.default.findByIdAndUpdate(req.params.id, { role, name }, { new: true, runValidators: true });
    if (!user)
        throw new error_middleware_1.AppError("User not found", 404);
    res.status(200).json({
        success: true,
        message: "User updated",
        data: user,
    });
});
// ─── PUT /api/admin/users/:id/block ──────────────────────────────────────────
exports.blockUser = (0, express_async_handler_1.default)(async (req, res) => {
    if (req.user?._id.toString() === req.params.id) {
        throw new error_middleware_1.AppError("You cannot block your own account", 400);
    }
    const user = await User_1.default.findById(req.params.id);
    if (!user)
        throw new error_middleware_1.AppError("User not found", 404);
    if (user.role === "admin") {
        throw new error_middleware_1.AppError("Admin accounts cannot be blocked", 400);
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.status(200).json({
        success: true,
        message: user.isBlocked ? "User blocked" : "User unblocked",
        data: user,
    });
});
// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────────
exports.deleteUser = (0, express_async_handler_1.default)(async (req, res) => {
    if (req.user?._id.toString() === req.params.id) {
        throw new error_middleware_1.AppError("You cannot delete your own account", 400);
    }
    const user = await User_1.default.findById(req.params.id);
    if (!user)
        throw new error_middleware_1.AppError("User not found", 404);
    await user.deleteOne();
    res.status(200).json({
        success: true,
        message: "User deleted",
    });
});
// ─── GET /api/admin/orders ────────────────────────────────────────────────────
exports.getAllOrders = (0, express_async_handler_1.default)(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page ?? "1"));
    const limit = Math.min(50, parseInt(req.query.limit ?? "10"));
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;
    const filter = {};
    if (status)
        filter.status = status;
    if (dateFrom || dateTo) {
        const dateFilter = {};
        if (dateFrom)
            dateFilter.$gte = new Date(dateFrom);
        if (dateTo) {
            const end = new Date(dateTo);
            end.setHours(23, 59, 59, 999);
            dateFilter.$lte = end;
        }
        filter.createdAt = dateFilter;
    }
    const [orders, total] = await Promise.all([
        Order_1.default.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "name email"),
        Order_1.default.countDocuments(filter),
    ]);
    res.status(200).json({
        success: true,
        data: orders,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
});
// ─── GET /api/admin/orders/:id ────────────────────────────────────────────────
exports.getOrderDetails = (0, express_async_handler_1.default)(async (req, res) => {
    const order = await Order_1.default.findById(req.params.id).populate("user", "name email");
    if (!order)
        throw new error_middleware_1.AppError("Order not found", 404);
    res.status(200).json({
        success: true,
        data: order,
    });
});
// ─── PUT /api/admin/orders/:id/status ────────────────────────────────────────
exports.updateOrderStatus = (0, express_async_handler_1.default)(async (req, res) => {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled", "returned"];
    if (!validStatuses.includes(status)) {
        throw new error_middleware_1.AppError(`Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400);
    }
    const order = await Order_1.default.findById(req.params.id);
    if (!order)
        throw new error_middleware_1.AppError("Order not found", 404);
    if (order.status !== status) {
        order.status = status;
        if (status === "delivered") {
            order.paymentStatus = "paid";
        }
        if ((status === "cancelled" || status === "returned") && order.paymentStatus === "paid") {
            order.paymentStatus = "refunded";
        }
        if (!order.statusHistory)
            order.statusHistory = [];
        order.statusHistory.push({
            status,
            updatedAt: new Date(),
            note: status === "delivered"
                ? "Order delivered and payment marked as Paid"
                : (status === "cancelled" || status === "returned") && order.paymentStatus === "refunded"
                    ? `Status updated to ${status} and payment refunded`
                    : `Status updated to ${status}`,
        });
        await order.save();
    }
    await order.populate("user", "name email");
    res.status(200).json({
        success: true,
        message: `Order status updated to '${status}'`,
        data: order,
    });
});
// ─── PUT /api/admin/orders/:id/exchange — handle exchange request ────────────
exports.updateExchangeStatus = (0, express_async_handler_1.default)(async (req, res) => {
    const { status, adminNote, markAsReturned } = req.body;
    const order = await Order_1.default.findById(req.params.id);
    if (!order)
        throw new error_middleware_1.AppError("Order not found", 404);
    if (!order.exchangeRequest) {
        throw new error_middleware_1.AppError("No exchange request found for this order", 400);
    }
    order.exchangeRequest.status = status;
    if (adminNote !== undefined)
        order.exchangeRequest.adminNote = adminNote;
    if (markAsReturned || status === "completed") {
        order.status = "returned";
        if (order.paymentStatus === "paid") {
            order.paymentStatus = "refunded";
        }
    }
    if (!order.statusHistory)
        order.statusHistory = [];
    order.statusHistory.push({
        status: order.status,
        updatedAt: new Date(),
        note: `Exchange request ${status}${adminNote ? `: ${adminNote}` : ""}`,
    });
    await order.save();
    res.status(200).json({
        success: true,
        message: `Exchange request ${status}`,
        data: order,
    });
});
// ─── PUT /api/admin/orders/:id/confirm-payment ────────────────────────────────
exports.confirmPayment = (0, express_async_handler_1.default)(async (req, res) => {
    const order = await Order_1.default.findById(req.params.id).populate("user", "name email");
    if (!order)
        throw new error_middleware_1.AppError("Order not found", 404);
    if (order.paymentStatus === "paid") {
        throw new error_middleware_1.AppError("Payment is already confirmed", 400);
    }
    order.paymentStatus = "paid";
    // Also move status to confirmed when payment verified
    if (order.status === "pending") {
        order.status = "confirmed";
        if (!order.statusHistory)
            order.statusHistory = [];
        order.statusHistory.push({
            status: "confirmed",
            updatedAt: new Date(),
            note: "Payment confirmed",
        });
    }
    await order.save();
    res.status(200).json({
        success: true,
        message: "Payment confirmed successfully",
        data: order,
    });
});
// ─── PUT /api/admin/orders/:id/refund-payment ─────────────────────────────────
exports.refundPayment = (0, express_async_handler_1.default)(async (req, res) => {
    const order = await Order_1.default.findById(req.params.id).populate("user", "name email");
    if (!order)
        throw new error_middleware_1.AppError("Order not found", 404);
    order.paymentStatus = "refunded";
    await order.save();
    res.status(200).json({
        success: true,
        message: "Payment marked as Refunded",
        data: order,
    });
});
// ─── GET /api/admin/messages ─────────────────────────────────────────────────
exports.getAllContactMessages = (0, express_async_handler_1.default)(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page ?? "1"));
    const limit = Math.min(100, parseInt(req.query.limit ?? "20"));
    const skip = (page - 1) * limit;
    const isRead = req.query.isRead;
    const filter = {};
    if (isRead === "true" || isRead === "false") {
        filter.isRead = isRead === "true";
    }
    const [messages, total, unreadCount] = await Promise.all([
        ContactMessage_1.default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        ContactMessage_1.default.countDocuments(filter),
        ContactMessage_1.default.countDocuments({ isRead: false }),
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
});
// ─── PUT /api/admin/messages/:id/read ────────────────────────────────────────
exports.markContactMessageRead = (0, express_async_handler_1.default)(async (req, res) => {
    const message = await ContactMessage_1.default.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!message)
        throw new error_middleware_1.AppError("Message not found", 404);
    res.status(200).json({
        success: true,
        message: "Message marked as read",
        data: message,
    });
});
// ─── GET /api/admin/activity-alerts ──────────────────────────────────────────
// Returns real-time system notifications for Admin Header (new orders, users, messages, applications)
exports.getAdminActivityAlerts = (0, express_async_handler_1.default)(async (_req, res) => {
    const [recentOrders, recentUsers, recentMessages, recentApplications] = await Promise.all([
        Order_1.default.find()
            .sort({ createdAt: -1 })
            .limit(8)
            .populate("user", "name email"),
        User_1.default.find({ role: "user" }).sort({ createdAt: -1 }).limit(8),
        ContactMessage_1.default.find().sort({ createdAt: -1 }).limit(8),
        JobApplication_1.default.find()
            .sort({ createdAt: -1 })
            .limit(8)
            .populate("job", "title"),
    ]);
    const orderAlerts = recentOrders.map((o) => {
        const u = o.user;
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
        const j = a.job;
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
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const alerts = combined.slice(0, 15);
    // Count alerts created in the last 24 hours as new
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const unreadCount = alerts.filter((a) => new Date(a.createdAt).getTime() > oneDayAgo).length;
    res.status(200).json({
        success: true,
        data: alerts,
        meta: { unreadCount },
    });
});
// ─── GET /api/admin/team ──────────────────────────────────────────────────────
exports.getAllAdminUsers = (0, express_async_handler_1.default)(async (_req, res) => {
    const adminUsers = await User_1.default.find({ role: "admin" })
        .select("-password")
        .sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        data: adminUsers,
    });
});
// ─── PUT /api/admin/users/:id/permissions ─────────────────────────────────────
exports.updateAdminPermissions = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { adminRole, permissions } = req.body;
    const currentAdmin = req.user;
    if (currentAdmin?.adminRole === "sub_admin") {
        throw new error_middleware_1.AppError("Only Root Admin can assign permissions to team members", 403);
    }
    const targetUser = await User_1.default.findById(id);
    if (!targetUser)
        throw new error_middleware_1.AppError("User not found", 404);
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
});
// ─── GET /api/admin/subscribers ───────────────────────────────────────────────
exports.getSubscribers = (0, express_async_handler_1.default)(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page ?? "1"));
    const limit = Math.min(100, parseInt(req.query.limit ?? "20"));
    const search = (req.query.search ?? "").trim();
    const skip = (page - 1) * limit;
    const filter = {};
    if (search) {
        filter.email = { $regex: search, $options: "i" };
    }
    const [subscribers, total, activeCount] = await Promise.all([
        Subscriber_1.default.find(filter)
            .sort({ subscribedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Subscriber_1.default.countDocuments(filter),
        Subscriber_1.default.countDocuments({ isActive: true }),
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
});
// ─── DELETE /api/admin/subscribers/:id ────────────────────────────────────────
exports.deleteSubscriber = (0, express_async_handler_1.default)(async (req, res) => {
    const subscriber = await Subscriber_1.default.findByIdAndDelete(req.params.id);
    if (!subscriber) {
        throw new error_middleware_1.AppError("Subscriber not found", 404);
    }
    res.status(200).json({
        success: true,
        message: "Subscriber removed successfully",
    });
});
// ─── PATCH /api/admin/subscribers/:id/toggle ─────────────────────────────────
exports.toggleSubscriberStatus = (0, express_async_handler_1.default)(async (req, res) => {
    const subscriber = await Subscriber_1.default.findById(req.params.id);
    if (!subscriber) {
        throw new error_middleware_1.AppError("Subscriber not found", 404);
    }
    subscriber.isActive = !subscriber.isActive;
    await subscriber.save();
    res.status(200).json({
        success: true,
        message: `Subscriber marked as ${subscriber.isActive ? "Active" : "Inactive"}`,
        data: subscriber,
    });
});
// ─── POST /api/admin/subscribers/broadcast ─────────────────────────────────────
exports.broadcastSubscribersEmail = (0, express_async_handler_1.default)(async (req, res) => {
    const { subject, title, messageBody, badgeText, bannerImageUrl, ctaButtonText, ctaButtonUrl, target = "active", } = req.body;
    if (!subject || !subject.trim()) {
        throw new error_middleware_1.AppError("Email subject is required", 400);
    }
    if (!title || !title.trim()) {
        throw new error_middleware_1.AppError("Email headline/title is required", 400);
    }
    if (!messageBody || !messageBody.trim()) {
        throw new error_middleware_1.AppError("Email message body is required", 400);
    }
    const filter = {};
    if (target === "active") {
        filter.isActive = true;
    }
    const subscribers = await Subscriber_1.default.find(filter).select("email");
    if (!subscribers || subscribers.length === 0) {
        throw new error_middleware_1.AppError("No subscribers found matching target criteria", 404);
    }
    const recipientEmails = subscribers.map((s) => s.email);
    // Call broadcast service
    const result = await (0, emailService_1.sendBroadcastEmail)({
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
});
//# sourceMappingURL=admin.controller.js.map