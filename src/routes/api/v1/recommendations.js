import express from 'express';
import { celebrate } from 'celebrate';
import { RecommendationController } from '../../../controllers';
import { recommendationValidator } from './validators';
import { checkAuth, asyncHandler, userExist } from '../../../middlewares';

const router = express.Router();

router
    .route('/:username')
    .post(
        checkAuth,
        userExist,
        celebrate({ body: recommendationValidator.recommend }),
        asyncHandler(RecommendationController.recommend),
    );

export default router;
