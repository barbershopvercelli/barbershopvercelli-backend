import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class VerifiedGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()

        if (request?.user) {
            const { id } = request.user
            const user = await this.prisma.user.findUnique({
                where: {
                    id
                }
            })
            if (user.isVerified) {
                return true
            }
            else {
                return false
            }
        }
        return false
    }

}