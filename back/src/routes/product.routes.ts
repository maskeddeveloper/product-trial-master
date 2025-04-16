import express from 'express';
import { Product } from '../models';
import { authenticateJWT, isAdmin } from '../middleware/auth.middleware';
import { ProductAttributes } from '../interfaces';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - code
 *         - name
 *         - description
 *         - image
 *         - category
 *         - price
 *         - internalReference
 *         - shellId
 *         - inventoryStatus
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the product
 *         code:
 *           type: string
 *           description: Product unique code
 *         name:
 *           type: string
 *           description: Product name
 *         description:
 *           type: string
 *           description: Product description
 *         image:
 *           type: string
 *           description: URL to product image
 *         category:
 *           type: string
 *           description: Product category
 *         price:
 *           type: number
 *           description: Product price
 *         quantity:
 *           type: integer
 *           description: Available quantity
 *           default: 0
 *         internalReference:
 *           type: string
 *           description: Internal reference code
 *         shellId:
 *           type: integer
 *           description: Shell identifier
 *         inventoryStatus:
 *           type: string
 *           enum: [INSTOCK, LOWSTOCK, OUTOFSTOCK]
 *           description: Current inventory status
 *         rating:
 *           type: number
 *           description: Product rating
 *           default: 0
 *         createdAt:
 *           type: integer
 *           description: Timestamp of creation
 *         updatedAt:
 *           type: integer
 *           description: Timestamp of last update
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Failed to create product
 */
router.post('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      image,
      category,
      price,
      quantity,
      internalReference,
      shellId,
      inventoryStatus,
      rating
    } = req.body;
    
    const product = await Product.create({
      code,
      name,
      description,
      image,
      category,
      price,
      quantity,
      internalReference,
      shellId,
      inventoryStatus,
      rating,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000)
    } as ProductAttributes);
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               inventoryStatus:
 *                 type: string
 *                 enum: [INSTOCK, LOWSTOCK, OUTOFSTOCK]
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to update product
 */
router.patch('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update fields
    await product.update({
      ...req.body,
      updatedAt: Math.floor(Date.now() / 1000)
    });
    
    res.json(await product.reload());
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to delete product
 */
router.delete('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await product.destroy();
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

export default router; 