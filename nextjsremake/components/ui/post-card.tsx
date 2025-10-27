import * as React from "react";
import { cn } from "@/lib/utils";
import { ThumbsUp } from "lucide-react";

const PostsCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl px-6 border-black dark:bg-periwinkle bg-periwinkle text-card-foreground shadow",
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

type PostsCardLikeButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    liked: boolean;
    likeCount: number;
  };

const PostsCardLikeButton = React.forwardRef<
  HTMLButtonElement,
  PostsCardLikeButtonProps
>(({ className, liked, likeCount, ...props }, ref) => {
  const iconColor = liked ? "#388659" : "#4D5061";

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={liked}
      className={cn(
        "flex items-center gap-1 rounded-full pb-4 text-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      <ThumbsUp
        className="h-4 w-4"
        color={iconColor}
        fill={liked ? iconColor : "none"}
      />
      <span style={{ color: iconColor }}>
        <p className="font-bold">{likeCount}</p>
      </span>
    </button>
  );
});
PostsCardLikeButton.displayName = "PostsCardLikeButton";

export {
  PostsCard,
  PostsCardHeader,
  PostsCardFooter,
  PostsCardTitle,
  PostsCardDescription,
  PostsCardContent,
  PostsCardAuthor,
  PostsCardLikeButton,
};
