import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extrae el usuario actual de la request
 */
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
