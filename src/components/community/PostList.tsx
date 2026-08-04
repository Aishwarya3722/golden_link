"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { PostCard } from "./PostCard";
import type { Post } from "@/lib/types";

interface PostListProps {
  userId: string;
}

// The Community module's feed — turns the app from a utility into a daily
// companion by giving seniors a safe space to post and comment (report
// section a.4 and Conclusion).
export function PostList({ userId }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("posts")
      .select("*, author:profiles(full_name, avatar_url)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPosts((data as any) ?? []);
        setLoading(false);
      });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;

    const { data } = await supabase
      .from("posts")
      .insert({ user_id: userId, content: draft.trim() })
      .select("*, author:profiles(full_name, avatar_url)")
      .single();

    if (data) {
      setPosts((prev) => [data as any, ...prev]);
      setDraft("");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Share something with the community..."
          maxLength={500}
          rows={3}
          className="mb-3 w-full rounded-2xl border-2 border-gray-200 p-4 text-lg focus:border-community focus:outline-none"
        />
        <Button variant="community" type="submit" disabled={!draft.trim()}>
          Post
        </Button>
      </form>

      {loading ? (
        <p className="text-ink-700">Loading community posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-ink-700">No posts yet — be the first to say hello!</p>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} userId={userId} />
          ))}
        </div>
      )}
    </div>
  );
}
