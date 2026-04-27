import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAgentRoute = createRouteMatcher(["/agent(.*)"]);
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/favorites(.*)",
  "/offers(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isAgentRoute(req)) {
    // Use publicMetadata.role — locked decision per ROADMAP.md (not Clerk Organizations)
    const { sessionClaims } = await auth.protect();
    if ((sessionClaims?.metadata as { role?: string })?.role !== "agent") {
      return Response.redirect(new URL("/", req.url));
    }
  } else if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
