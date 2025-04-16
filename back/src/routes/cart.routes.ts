import express from 'express';
import { Cart, CartItem, Product } from '../models';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The cart item ID
 *         CartId:
 *           type: integer
 *           description: The cart ID
 *         ProductId:
 *           type: integer
 *           description: The product ID
 *         quantity:
 *           type: integer
 *           description: The quantity of the product
 *           minimum: 1
 *         Product:
 *           $ref: '#/components/schemas/Product'
 *     Cart:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The cart ID
 *         UserId:
 *           type: integer
 *           description: The user ID
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         CartItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to fetch cart
 */
router.get('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    let cart = await Cart.findOne({ 
      where: { UserId: req.user.id },
      include: [
        {
          model: CartItem,
          include: [Product]
        }
      ]
    });
    
    if (!cart) {
      cart = await Cart.create({ 
        UserId: req.user.id,
        updatedAt: new Date()
      });
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: Product ID to add to cart
 *               quantity:
 *                 type: integer
 *                 description: Quantity to add
 *                 default: 1
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Product added to cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to add to cart
 */
router.post('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { productId, quantity = 1 } = req.body;
    
    // Validate product
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Find or create cart
    let cart = await Cart.findOne({ where: { UserId: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ 
        UserId: req.user.id,
        updatedAt: new Date()
      });
    }
    
    // Check if product already in cart
    let cartItem = await CartItem.findOne({
      where: {
        CartId: (cart as any).id,
        ProductId: productId
      }
    });
    
    if (cartItem) {
      // Update quantity if product exists
      await cartItem.update({
        quantity: (cartItem as any).quantity + quantity
      });
    } else {
      // Add new product to cart
      await CartItem.create({
        CartId: (cart as any).id,
        ProductId: productId,
        quantity
      });
    }
    
    // Update cart timestamp
    await cart.update({ updatedAt: new Date() });
    
    // Return populated cart
    const updatedCart = await Cart.findOne({ 
      where: { UserId: req.user.id },
      include: [
        {
          model: CartItem,
          include: [Product]
        }
      ]
    });
    
    res.json(updatedCart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
});

/**
 * @swagger
 * /api/cart/{productId}:
 *   delete:
 *     summary: Remove product from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID to remove
 *     responses:
 *       200:
 *         description: Product removed from cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Cart or product not found
 *       500:
 *         description: Failed to remove from cart
 */
router.delete('/:productId', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { productId } = req.params;
    
    // Find cart
    const cart = await Cart.findOne({ where: { UserId: req.user.id } });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Remove product from cart
    await CartItem.destroy({
      where: {
        CartId: (cart as any).id,
        ProductId: productId
      }
    });
    
    // Update cart timestamp
    await cart.update({ updatedAt: new Date() });
    
    // Return populated cart
    const updatedCart = await Cart.findOne({ 
      where: { UserId: req.user.id },
      include: [
        {
          model: CartItem,
          include: [Product]
        }
      ]
    });
    
    res.json(updatedCart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Failed to remove from cart' });
  }
});

/**
 * @swagger
 * /api/cart/{productId}:
 *   patch:
 *     summary: Update product quantity in cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: New quantity
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Invalid quantity
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Cart or product not found
 *       500:
 *         description: Failed to update cart
 */
router.patch('/:productId', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }
    
    // Find cart
    const cart = await Cart.findOne({ where: { UserId: req.user.id } });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Find product in cart
    const cartItem = await CartItem.findOne({
      where: {
        CartId: (cart as any).id,
        ProductId: productId
      }
    });
    
    if (!cartItem) {
      return res.status(404).json({ message: 'Product not in cart' });
    }
    
    // Update quantity
    await cartItem.update({ quantity });
    
    // Update cart timestamp
    await cart.update({ updatedAt: new Date() });
    
    // Return populated cart
    const updatedCart = await Cart.findOne({ 
      where: { UserId: req.user.id },
      include: [
        {
          model: CartItem,
          include: [Product]
        }
      ]
    });
    
    res.json(updatedCart);
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Failed to update cart' });
  }
});

export default router; 