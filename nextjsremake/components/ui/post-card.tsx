import * as React from "react";
import { cn } from "@/lib/utils";

const PostsCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl px-6 border dark:bg-periwinkle bg-periwinkle text-card-foreground shadow",
      className
    )}
    {...props}
  />
));
PostsCard.displayName = "PostsCard";

const PostsCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 text-black", className)}
    {...props}
  />
));
PostsCardHeader.displayName = "PostsCardHeader";

const PostsCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "font-semibold leading-none tracking-tight hover:underline",
      className
    )}
    {...props}
  />
));
PostsCardTitle.displayName = "PostsCardTitle";

const PostsCardAuthor = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mb-1 text-sm hover:underline", className)}
    {...props}
  />
));
PostsCardAuthor.displayName = "PostsCardAuthor";

const PostsCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("py-2 pb-6", className)} {...props} />
));
PostsCardContent.displayName = "PostsCardContent";

const PostsCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground text-black", className)}
    {...props}
  />
));
PostsCardDescription.displayName = "PostsCardDescription";

const PostsCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pb-6 pt-4 text-black", className)}
    {...props}
  />
));
PostsCardFooter.displayName = "PostsCardFooter";

export {
  PostsCard,
  PostsCardHeader,
  PostsCardFooter,
  PostsCardTitle,
  PostsCardDescription,
  PostsCardContent,
  PostsCardAuthor,
};
