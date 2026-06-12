import React, { useState } from "react";
import { Home, MessageCircle, Bell, Plus } from "lucide-react";
import { supabase } from "../../configs/supbase";

export default function TopNavbar({ onPostCreated }) {
  const [openPost, setOpenPost] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const createPost = async () => {
    if (!text.trim()) return;

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
      setLoading(false);
      return;
    }

   

    const { error } = await supabase.from("posts").insert({
      content: text,
      user_id: userData.user.id,
      profile_name: userData.user.user_metadata.full_name
    });

    setLoading(false);

    alert("post successful")

    if (error) {
      console.log(error);
      return;
    }

    setText("");
    setOpenPost(false);

    // refresh feed instantly
    if (onPostCreated) onPostCreated();
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="h-16 flex items-center justify-between px-4">
          <h1 className="font-bold text-purple-700">SOCIALGIST</h1>

          <div className="flex gap-3">
            <Home />
            <MessageCircle />
            <Bell />

            <button
              onClick={() => setOpenPost(true)}
              className="bg-purple-600 text-white p-2 rounded-full"
            >
              <Plus />
            </button>
          </div>
        </div>
      </header>

      {/* POST MODAL */}
      {openPost && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded-xl w-full max-w-md">

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-32 border p-2 rounded"
              placeholder="What's happening?"
            />

            <button
              onClick={createPost}
              disabled={loading}
              className="w-full mt-3 bg-purple-600 text-white p-2 rounded"
            >
              {loading ? "Posting..." : "Post"}
            </button>

            <button
              onClick={() => setOpenPost(false)}
              className="w-full mt-2 text-sm text-gray-500"
            >
              Cancel
            </button>

          </div>
        </div>
      )}
    </>
  );
}