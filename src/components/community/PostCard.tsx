import { Card } from "@/components/ui/Card";
import { CommentSection } from "./CommentSection";
import { formatDateTime } from "@/lib/utils";
import type { Post } from "@/lib/types";

interface PostCardProps {
  post: Post;
  userId: string;
}

export function PostCard({ post, userId }: PostCardProps) {
  return (
    <Card>
      <div className="mb-1 flex items-baseline justify-between">
        <p className="font-bold">{post.author?.full_name ?? "Someone"}</p>
        <p className="text-xs text-gray-400">{formatDateTime(post.created_at)}</p>
      </div>
      <p className="text-lg">{post.content}</p>
      <CommentSection postId={post.id} userId={userId} />
    </Card>
  );
}
