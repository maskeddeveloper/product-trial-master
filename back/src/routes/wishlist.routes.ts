import express from 'express';
import { Wishlist, Product } from '../models';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Wishlist:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The wishlist ID
 *         UserId:
 *           type: integer
 *           description: The user ID
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         Products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Product'
 */

// Get user's wishlist
/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Get user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's wishlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wishlist'
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Failed to fetch wishlist
 */
router.get('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    let wishlist = await Wishlist.findOne({ 
      where: { UserId: req.user.id },
      include: [Product]
    });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ 
        UserId: req.user.id,
        updatedAt: new Date()
      });
    }
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
});

// Add product to wishlist
/**
 * @swagger
 * /api/wishlist:
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Wishlist]
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
 *                 description: Product ID to add to wishlist
 *     responses:
 *       200:
 *         description: Product added to wishlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wishlist'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to add to wishlist
 */
router.post('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { productId } = req.body;
    
    // Validate product
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ where: { UserId: req.user.id } });
    if (!wishlist) {
      wishlist = await Wishlist.create({ 
        UserId: req.user.id,
        updatedAt: new Date()
      });
    }
    
    // Add product to wishlist
    await (wishlist as any).addProduct(product);
    
    // Update wishlist timestamp
    await wishlist.update({ updatedAt: new Date() });
    
    // Return populated wishlist
    const updatedWishlist = await Wishlist.findOne({ 
      where: { UserId: req.user.id },
      include: [Product]
    });
    
    res.json(updatedWishlist);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Failed to add to wishlist' });
  }
});

// Remove product from wishlist
/**
 * @swagger
 * /api/wishlist/{productId}:
 *   delete:
 *     summary: Remove product from wishlist
 *     tags: [Wishlist]
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
 *         description: Product removed from wishlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wishlist'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Wishlist or product not found
 *       500:
 *         description: Failed to remove from wishlist
 */
router.delete('/:productId', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { productId } = req.params;
    
    // Find wishlist
    const wishlist = await Wishlist.findOne({ where: { UserId: req.user.id } });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    // Find product
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Remove product from wishlist
    await (wishlist as any).removeProduct(product);
    
    // Update wishlist timestamp
    await wishlist.update({ updatedAt: new Date() });
    
    // Return populated wishlist
    const updatedWishlist = await Wishlist.findOne({ 
      where: { UserId: req.user.id },
      include: [Product]
    });
    
    res.json(updatedWishlist);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Failed to remove from wishlist' });
  }
});

export default router; 