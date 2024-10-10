import { ValidationResult } from 'joi';
import { Context, Next } from 'koa';
import passport from 'koa-passport';
import { Roles } from '../../../shared/types/common';
import { User } from '../../../shared/types/user';
import { ErrorMessage } from '../constants/errorMessage';
import BadRequestError from '../errors/BadRequestError';
import ForbiddenError from '../errors/ForbiddenError';

export async function errorHandler(ctx: Context, next: Next): Promise<void> {
  try {
    await next();
  } catch (err: any) {
    const status = err.status || 500;
    const body = err.data
      ? err.data
      : { message: err.message, description: err.type, stack: err.stack };
    ctx.status = status;
    ctx.body = body;
  }
}

export function validator<T>(validationFunction: (ctx: Context) => T) {
  return async (ctx: Context, next: Next): Promise<void> => {
    const result = await validationFunction(ctx);
    ctx.state = { ...ctx.state, ...result };
    await next();
  };
}

export function validate<T>(validationFunction: (ctx: Context) => ValidationResult<T> | false) {
  return async (ctx: Context, next: Next) => {
    const result = validationFunction(ctx);
    if (!result) throw new BadRequestError(ErrorMessage.invalidRequest, 'invalidRequest');
    if (result.error) {
      const errors = result.error.details
        .map(e => ({
          location: e.path[0],
          param: e.context?.label,
          msg: e.message,
          type: e.type === 'any.required' || e.type === 'any.empty'
            ? 'REQUIRED' : 'INVALID',
        }),
        );
      throw new BadRequestError(errors[0].msg, 'validate');
    } else {
      ctx.state.body = result.value;
    }

    await next();
  };
}

export function accessChecker(userRoles: Roles[]) {
  return async function (ctx, next) {
    const user = ctx.state.user as User;
    if (!user || !userRoles.includes(user.role!)) throw new ForbiddenError(ErrorMessage.notPermission, 'notPermission');
    return next();
  };
}

export function auth() {
  return passport.authenticate('oauth-bearer', { session: false });
}