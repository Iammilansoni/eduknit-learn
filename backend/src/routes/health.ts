import express from 'express';
import mongoose from 'mongoose';
import emailService from '../services/emailService';
import logger from '../config/logger';
import { success } from '../utils/response';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', (req, res) => {
  success(res, {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  }, 'Service is healthy');
});

/**
 * @route   GET /api/health/detailed
 * @desc    Detailed health check with all services
 * @access  Public
 */
router.get('/detailed', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {
      database: 'UNKNOWN',
      email: 'UNKNOWN',
    },
    checks: {
      database: false,
      email: false,
    }
  };

  try {
    // Check database connection
    if (mongoose.connection.readyState === 1) {
      health.services.database = 'CONNECTED';
      health.checks.database = true;
    } else {
      health.services.database = 'DISCONNECTED';
      health.status = 'DEGRADED';
    }

    // Check email service
    try {
      const emailTest = await emailService.testConnection();
      health.services.email = emailTest ? 'CONNECTED' : 'DISCONNECTED';
      health.checks.email = emailTest;
      if (!emailTest) {
        health.status = 'DEGRADED';
      }
    } catch (error) {
      health.services.email = 'ERROR';
      health.status = 'DEGRADED';
      logger.error('Email service health check failed:', error);
    }

    // Determine overall status
    if (health.status === 'OK' && (!health.checks.database || !health.checks.email)) {
      health.status = 'DEGRADED';
    }

    const statusCode = health.status === 'OK' ? 200 : 503;
    res.status(statusCode).json({
      success: true,
      data: health,
      message: `Service is ${health.status.toLowerCase()}`,
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl
    });
    return;

  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Health check failed',
      },
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl
    });
    return;
  }
});

/**
 * @route   GET /api/health/ready
 * @desc    Readiness probe for Kubernetes
 * @access  Public
 */
router.get('/ready', async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        success: false,
        error: {
          code: 'NOT_READY',
          message: 'Database not connected',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    success(res, {
      status: 'READY',
      timestamp: new Date().toISOString(),
    }, 'Service is ready');

  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      success: false,
      error: {
        code: 'NOT_READY',
        message: 'Service not ready',
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }
});

/**
 * @route   GET /api/health/live
 * @desc    Liveness probe for Kubernetes
 * @access  Public
 */
router.get('/live', (req, res) => {
  success(res, {
    status: 'ALIVE',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }, 'Service is alive');
});

export default router;