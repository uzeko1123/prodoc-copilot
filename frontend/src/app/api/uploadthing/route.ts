import { createRouteHandler } from 'uploadthing/next';

import { ourFileRouter } from '@/lib/shadcn/uploadthing';

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
