import { ourFileRouter } from '@/lib/shadcn/uploadthing';
import { createRouteHandler } from 'uploadthing/next';

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
