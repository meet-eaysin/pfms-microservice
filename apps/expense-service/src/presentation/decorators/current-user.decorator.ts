import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * CurrentUser - Parameter decorator to extract userId from request
 *
 * Must be used with AuthGuard to ensure userId is set.
 *
 * @example
 * @Get()
 * @UseGuards(AuthGuard)
 * async findAll(@CurrentUser() userId: string) {
 *   return this.service.findAll(userId);
 * }
 */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  return request.userId;
});
