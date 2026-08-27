import { Response } from "express";
import asyncHandler from "express-async-handler";
import Cart from "../models/Cart";
import Product from "../models/Product";
import { AppError } from "../middleware/error.middleware";
import { AuthRequest } from "../types";

// ─── GET /api/cart ────────────────────────────────────────────────────────────

export const getCart = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const cart = await Cart.findOne({ user: req.user?._id }).populate(
      "items.product",
      "name price originalPrice images inStock"
    );

    if (!cart) {
      res.status(200).json({ success: true, data: { items: [] } });
      return;
    }

    res.status(200).json({ success: true, data: cart });
  }
);

// ─── POST /api/cart ───────────────────────────────────────────────────────────

export const addToCart = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { productId, quantity = 1, size, color } = req.body as {
      productId: string;
      quantity?: number;
      size: string;
      color: string;
    };

    if (!productId || !size || !color) {
      throw new AppError("productId, size, and color are required", 400);
    }

    const product = await Product.findById(productId);
    if (!product) throw new AppError("Product not found", 404);
    if (!product.inStock) throw new AppError("Product is out of stock", 400);

    let cart = await Cart.findOne({ user: req.user?._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user?._id,
        items: [{ product: productId, quantity, size, color }],
      });
    } else {
      const existingIndex = cart.items.findIndex(
        (item) =>
          item.product.toString() === productId &&
          item.size === size &&
          item.color === color
      );

      if (existingIndex >= 0) {
        cart.items[existingIndex].quantity += quantity;
      } else {
        cart.items.push({ product: product._id, quantity, size, color });
      }

      await cart.save();
    }

    const populated = await cart.populate(
      "items.product",
      "name price originalPrice images inStock"
    );

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: populated,
    });
  }
);

// ─── PUT /api/cart/:productId ─────────────────────────────────────────────────

export const updateCartItem = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { quantity, size, color } = req.body as {
      quantity: number;
      size: string;
      color: string;
    };

    if (!quantity || quantity < 1) {
      throw new AppError("Quantity must be at least 1", 400);
    }

    const cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) throw new AppError("Cart not found", 404);

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === req.params.productId &&
        item.size === size &&
        item.color === color
    );

    if (itemIndex === -1) throw new AppError("Item not found in cart", 404);

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    const populated = await cart.populate(
      "items.product",
      "name price originalPrice images inStock"
    );

    res.status(200).json({
      success: true,
      message: "Cart updated",
      data: populated,
    });
  }
);

// ─── DELETE /api/cart/:productId ──────────────────────────────────────────────

export const removeCartItem = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { size, color } = req.query as { size: string; color: string };

    const cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) throw new AppError("Cart not found", 404);

    const before = cart.items.length;
    cart.items = cart.items.filter(
      (item) =>
        !(
          item.product.toString() === req.params.productId &&
          item.size === size &&
          item.color === color
        )
    );

    if (cart.items.length === before) {
      throw new AppError("Item not found in cart", 404);
    }

    await cart.save();

    const populated = await cart.populate(
      "items.product",
      "name price originalPrice images inStock"
    );

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: populated,
    });
  }
);

// ─── DELETE /api/cart ─────────────────────────────────────────────────────────

export const clearCart = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    await Cart.findOneAndUpdate(
      { user: req.user?._id },
      { items: [] },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Cart cleared",
      data: { items: [] },
    });
  }
);
