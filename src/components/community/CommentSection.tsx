"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";
import type { Comment } from "@/lib/types";

interface CommentSectionProps {
  postId: string;
  userId: string;
}

export function CommentSection({ postId, userId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("comments")
      .select("*, author:profiles(full_name, avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .then(({ data }) => setComments((data as any) ?? []));
  }, [postId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    const { data } = await supabase
      .from("comments")
      .insert({ post_id: postId, user_id: userId, comment_text: text.trim() })
      .select("*, author:profiles(full_name, avatar_url)")
      .single();

    if (data) {
      setComments((prev) => [...prev, data as any]);
      setText("");
    }
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      {comments.map((c) => (
        <div key={c.id} className="mb-2 text-sm">
          <span className="font-semibold">{c.author?.full_name ?? "Someone"}: </span>
          <span>{c.comment_text}</span>
          <span className="ml-2 text-xs text-gray-400">{formatDateTime(c.created_at)}</span>
        </div>
      ))}
      <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="min-h-touch flex-1 rounded-xl border-2 border-gray-200 px-3 focus:border-community focus:outline-none"
        />
        <button type="submit" className="min-h-touch rounded-xl bg-community px-4 font-semibold text-white">
          Send
        </button>
      </form>
    </div>
  );
}
