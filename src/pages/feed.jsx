
import { supabase } from "../configs/supbase";
import { useState, useEffect } from "react";
import { BiShare } from "react-icons/bi";
import {
  MessageCircle,
  Wifi,
  WifiOff,
  RefreshCcw,
  ThumbsUp,
  Heart,
  Send,
  Share2,
  Flame,
  Sparkles,
  Users,
  CornerUpRight,
  CornerUpLeftIcon,
  MessageSquare,
  HeartHandshake,
  Globe,
  MoreVertical
} from "lucide-react";
import { showNotification } from "../utils/notifications";
import { sendNotification } from "../utils/sendNotifications";
import ProfileModal from "./profileModal";
import { toPng } from "html-to-image";
import { data } from "react-router-dom";
/* import { createNotification } from "../utils/createNotifications"; */
/* import Share from "@capacitor/share"; */
import OneSignal from "react-onesignal";




export default function Feed({
  onOpenMessages,
}) {
  const [me, setMe] =
    useState(null);

  const [posts, setPosts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [isOnline, setIsOnline] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [likedPosts, setLikedPosts] =
    useState({});

  const [animatingLike, setAnimatingLike] =
    useState(null);



  const [openProfile, setOpenProfile] =
    useState(false);


  const [selectedProfile, setSelectedProfile] =
    useState(null);

  const [activeTab, setActiveTab] = useState("all");

  const [open, setOpen] = useState(false);
  const [loadingcomment, setLoadingcomment] = useState(true);
  const [comments, setComments] = useState([]);

  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);

  const [userProfile, setUserProfile] = useState(null);



  const [activePost, setActivePost] = useState(null);

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileId, setProfileId] = useState(null)
  const [followingIds, setFollowingIds] = useState([]);

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);


  const [page, setPage] = useState(0);
  const POSTS_PER_PAGE = 5;
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [profileImages, setProfileImages] = useState({});

  const [openMenuId, setOpenMenuId] = useState(null);

  const getProfileImage = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile image:", error);
      return null;
    }

    return data.avatar_url;
  };


  useEffect(() => {
    const setupUser = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data?.user?.id;

      if (!userId) return;

      // tag user in OneSignal
      OneSignal.setExternalUserId(userId);
    };

    setupUser();
  }, []);

  const toggleFollow = async (profile) => {
    if (!me?.id || !profile?.id) return;

    const alreadyFollowing = followingIds.includes(profile.id);

    try {
      if (alreadyFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", me.id)
          .eq("following_id", profile.id);

        if (error) throw error;

        setFollowingIds(prev =>
          prev.filter(id => id !== profile.id)
        );

        // UPDATE MODAL COUNT IMMEDIATELY
        setProfileData(prev =>
          prev?.id === profile.id
            ? {
              ...prev,
              followers_count: Math.max(
                (prev.followers_count || 0) - 1,
                0
              ),
            }
            : prev
        );

        await supabase.rpc("decrease_followers", {
          target_id: profile.id,
          my_id: me.id,
        });

      } else {
        const { error } = await supabase
          .from("follows")
          .insert({
            follower_id: me.id,
            following_id: profile.id,
          });

        if (error) throw error;

        setFollowingIds(prev => [...prev, profile.id]);

        // UPDATE MODAL COUNT IMMEDIATELY
        setProfileData(prev =>
          prev?.id === profile.id
            ? {
              ...prev,
              followers_count: (prev.followers_count || 0) + 1,
            }
            : prev
        );

        await supabase.rpc("increase_followers", {
          target_id: profile.id,
          my_id: me.id,
        });
      }
    } catch (err) {
      console.log("FOLLOW ERROR", err.message);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();

    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    if (diff < 172800) return "yesterday";

    return date.toLocaleDateString();
  };

  const openComments = async (post) => {
    setOpen(true);
    setLoadingcomment(true);
    setComments([]);
    setActivePost(post);

    try {
      const { data, error } = await supabase
        .from("posts")
        .select("comments")
        .eq("id", post.id)
        .single();

      if (error) throw error;

      setComments(data?.comments || []);
      setActivePost((prev) => ({
        ...prev,
        comments: data?.comments || [],
      }));

    } catch (err) {
      console.log(err);
    } finally {
      setLoadingcomment(false);
    }
  };

  /*   useEffect(() => {
      if (!me?.id) return;
  
      window.OneSignalDeferred = window.OneSignalDeferred || [];
  
      window.OneSignalDeferred.push(async function (OneSignal) {
        try {
  
          // wait until OneSignal is ready
          const permission = OneSignal.Notifications.permission;
  
          if (!permission) {
            await OneSignal.Notifications.requestPermission();
          }
  
          // wait for subscription
          const subscriptionId =
            OneSignal.User.PushSubscription.id;
  
          console.log("Subscription:", subscriptionId);
  
          if (subscriptionId) {
            await OneSignal.login(String(me.id));
  
            console.log(
              "OneSignal linked:",
              me.id
            );
          } else {
            console.log("No push subscription yet");
          }
  
        } catch (err) {
          console.error("OneSignal setup error:", err);
        }
      });
  
    }, [me?.id]); */

  useEffect(() => {
    setPage(0);
    setPosts([]);
    fetchPosts(true);
  }, [activeTab]);




  const openUserProfile = async (userId) => {
    try {
      setProfileOpen(true);
      /*   setProfileData(null); */

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setProfileData({
        ...data,
        viewer_id: me?.id,
        isFollowing: followingIds.includes(userId),
      });

    } catch (err) {
      console.log("Profile load error:", err);
    }
  };


  useEffect(() => {
    if (!activePost?.id) return;

    const channel = supabase
      .channel("post-comments-live")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "posts",
          filter: `id=eq.${activePost.id}`,
        },
        (payload) => {
          const updatedComments = payload.new.comments || [];

          // update modal comments live
          setComments(updatedComments);

          // update header counter live
          setActivePost((prev) => ({
            ...prev,
            comments: updatedComments,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activePost?.id]);



  const getUserProfile = async (userId) => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;


      return {
        ...data,
        viewer_id: me?.id,
        isFollowing: followingIds.includes(userId),
      };

    } catch (err) {
      console.error("Profile fetch error:", err.message);
      return null;
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getUserProfile(me?.id);

      if (!profile) return;

      setProfileId(profile.id);
      console.log(profile);
    };

    if (me?.id) {
      loadProfile();
    }

  }, [me?.id]);




  /*    useEffect(() => {
  
      if (!me?.id) return;
  
  
      window.OneSignalDeferred = window.OneSignalDeferred || [];
  
  
      window.OneSignalDeferred.push(async function (OneSignal) {
  
        try {
  
          await OneSignal.login(me.id);
  
  
          console.log(
            "OneSignal user connected:",
            me.id
          );
  
        } catch (err) {
  
          console.log(
            "OneSignal login error:",
            err
          );
  
        }
  
      });
  
  
    }, [me?.id]);
  
    */

  const loadFollowing = async () => {
    if (!me?.id) return;

    const { data, error } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", me.id);

    if (error) {
      console.log(error);
      return;
    }


    setFollowingIds(
      data.map(item => item.following_id)
    );
  };

  useEffect(() => {
    if (me?.id) {
      loadFollowing();
    }
  }, [me?.id]);

  const addCommentToPost = async () => {
    if (!commentText.trim() || !activePost) return;



    const profile = await getUserProfile(me.id);

    console.log(profile.avatar_url);

    const newComment = {
      id: crypto.randomUUID(),
      user: me?.user_metadata.full_name || "Anonymous",
      user_id: me?.id,
      avatar: profile.avatar_url,
      text: commentText.trim(),
      created_at: new Date().toISOString(),
    };

    /*  console.log(newComment) */

    // 1. INSTANT UI UPDATE
    setComments((prev) => [newComment, ...prev]);
    setCommentText("");

    try {
      // 2. GET CURRENT COMMENTS FROM POST
      const { data, error } = await supabase
        .from("posts")
        .select("comments")
        .eq("id", activePost.id)
        .single();

      if (error) throw error;

      const existing = data?.comments || [];


      //COMMENT ARRAY
      const updated = [newComment, ...(existing || [])];


      //SAVE BACK TO SUPBASE
      await supabase
        .from("posts")
        .update({
          comments: updated,
          comments_count: updated.length,
        })
        .eq("id", activePost.id);


      setComments(updated);
      setActivePost((prev) => ({
        ...prev,
        comments: updated,
      }));

      {

        await sendNotification({
          title: "💬 New Comment",
          body: "You commented on a post",
        });

        console.log("💬 COMMENT RECEIVED");
      }


    } catch (err) {
      console.error("Comment failed:", err.message);
    }
  };







  const loadMorePosts = async () => {
    if (
      loadingMore ||
      !hasMore ||
      refreshing
    )
      return;

    setLoadingMore(true);

    const nextPage = page + 1;

    try {
      const from =
        nextPage * POSTS_PER_PAGE;

      const to =
        from + POSTS_PER_PAGE - 1;

      const { data, error } =
        await supabase
          .from("posts")
          .select("*")
          .order("created_at", {
            ascending: false,
          })
          .range(from, to);

      if (error) {
        console.log(error);
        return;
      }

      if (data?.length) {
        setPosts((prev) => {
          const existingIds = new Set(
            prev.map((p) => p.id)
          );

          const newPosts = data.filter(
            (post) => !existingIds.has(post.id)
          );

          return [...prev, ...newPosts];
        });
        setPage(nextPage);

        if (
          data.length <
          POSTS_PER_PAGE
        ) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.log(err);
    }

    setLoadingMore(false);
  };




  // ================= FETCH POSTS =================


  const fetchPosts = async (
    showLoader = false
  ) => {
    try {

      if (showLoader) {
        setLoading(true);
      }

      setRefreshing(true);



      const from = page * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      /*      const { data, error } =
             await supabase
               .from("posts")
               .select("*")
               .order("created_at", {
                 ascending: false,
               })
               .range(from, to); */
      let query = supabase
        .from("posts")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      // ================= CATEGORY FILTER =================
      if (activeTab !== "all") {
        query = query.eq("category", activeTab);
      }

      const { data, error } = await query.range(from, to);

      if (error) {
        console.log(error);

        setRefreshing(false);
        setLoading(false);

        return;
      }

      const imageMap = {};

      await Promise.all(
        data.map(async (postData) => {
          const avatarUrl = await getProfileImage(postData.user_id);

          imageMap[postData.user_id] = avatarUrl;
        })
      );

      setProfileImages(imageMap);


      if (data) {
        let formatted =
          data.map((post) => ({
            ...post,
            likes_count:
              post.likes_count,
          }));




        setPosts((prev) => {
          const merged =
            page === 0
              ? formatted
              : [...prev, ...formatted];

          const uniquePosts =
            merged.filter(
              (post, index, self) =>
                index ===
                self.findIndex(
                  (p) => p.id === post.id
                )
            );

          return uniquePosts;
        });


        if (
          !data ||
          data.length < POSTS_PER_PAGE
        ) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (err) {
      console.log(err);
    }

    setRefreshing(false);
    setLoading(false);
  };

  useEffect(() => {

    const getUser =
      async () => {

        const { data } =
          await supabase.auth.getUser();

        setMe(
          data?.user || null
        );

        console.log(data)

      };

    getUser();

  }, []);


  useEffect(() => {
    fetchPosts(true);
  }, []);

  // ================= REALTIME =================

  useEffect(() => {
    const channel = supabase
      .channel("feed-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        async (payload) => {
          console.log("🔥 FEED UPDATE:", payload);

          const { eventType, new: newRow, old: oldRow } = payload;

          // =========================
          // DELETE POST
          // =========================
          if (eventType === "DELETE") {
            setPosts((prev) =>
              prev.filter((post) => post.id !== oldRow.id)
            );
            return;
          }

          // =========================
          // UPDATE POSTS IN UI
          // =========================
          if (eventType === "UPDATE") {
            setPosts((prev) =>
              prev.map((post) =>
                post.id === newRow.id
                  ? {
                    ...post,
                    likes_count: newRow.likes_count ?? 0,
                    comments_count: newRow.comments_count ?? 0,
                    shares_count: newRow.shares_count ?? 0,
                    updated_at: newRow.updated_at,
                  }
                  : post
              )
            );

            // =========================
            // NOTIFICATIONS (WEB ONLY)
            // =========================

            const oldLikes = oldRow?.likes_count || 0;
            const newLikes = newRow?.likes_count || 0;

            if (newLikes > oldLikes && newRow.user_id === me?.id) {
              await createNotification({
                receiver_id: post.user_id, // User A
                sender: user,              // User B
                type: "like",
                message: "liked your post ❤️",
                post_id: post.id,
              });
            }

            const oldShares = oldRow?.shares_count || 0;
            const newShares = newRow?.shares_count || 0;

            if (newShares > oldShares && newRow.user_id === me?.id) {
              await createNotification({
                receiver_id: post.user_id,
                sender: user,
                type: "share",
                message: "shared your post 🔁",
                post_id: post.id,
              });
            }

            const oldComments = oldRow?.comments_count || 0;
            const newComments = newRow?.comments_count || 0;

            if (newComments > oldComments && newRow.user_id === me?.id) {
              await createNotification({
                receiver_id: post.user_id,
                sender: user,
                type: "comment",
                message: "commented on your post 💬",
                post_id: post.id,
              });
            }

            return;
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 Feed Status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [me?.id]);

  const LIKES_KEY = "liked_posts_v1";

  // ================= SAVE TO LOCALSTORAGE =================
  const saveLikesToLocal = (likesMap) => {
    try {
      localStorage.setItem(LIKES_KEY, JSON.stringify(likesMap));
    } catch (err) {
      console.log("SAVE LOCAL LIKES ERROR:", err);
    }
  };

  // ================= LOAD FROM LOCALSTORAGE =================
  const loadLikesFromLocal = () => {
    try {
      const value = localStorage.getItem(LIKES_KEY);
      return value ? JSON.parse(value) : {};
    } catch (err) {
      console.log("LOAD LOCAL LIKES ERROR:", err);
      return {};
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("follow-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          console.log("👥 PROFILE UPDATE:", payload);

          const updatedProfile = payload.new;

          setProfileData((prev) =>
            prev?.id === updatedProfile?.id
              ? {
                ...prev,
                post: payload.new.post,
                followers_count: updatedProfile.followers_count,
                following_count: updatedProfile.following_count,
              }
              : prev
          );

          // OPTIONAL: if you show profiles in feed posts
          setPosts((prev) =>
            prev.map((post) =>
              post.user_id === updatedProfile.id
                ? {
                  ...post,
                  followers_count: updatedProfile.followers_count,
                  following_count: updatedProfile.following_count,
                }
                : post
            )
          );
        }
      )
      .subscribe((status) => {
        console.log("📡 Follow Status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  // ================= NETWORK =================



  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.scrollY;

      const windowHeight =
        window.innerHeight;

      const fullHeight =
        document.documentElement
          .scrollHeight;

      if (
        scrollTop +
        windowHeight >=
        fullHeight - 500
      ) {
        loadMorePosts();
      }
    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );

  }, [posts, hasMore]);


  const loadUserLikes = async (userId) => {
    if (!userId) return;

    try {
      const local = localStorage.getItem("liked_posts_v1");
      const likesMap = local ? JSON.parse(local) : {};

      setLikedPosts(likesMap);
    } catch (err) {
      console.log("LOAD LIKES ERROR:", err);
      setLikedPosts({});
    }
  };


  useEffect(() => {

    if (!me?.id) return;

    const localLikes = localStorage.getItem("liked_posts_v1");
    setLikedPosts(localLikes ? JSON.parse(localLikes) : {});
  }, [me?.id]);


  const createNotification = async ({
    receiver_id,
    sender,
    type,
    message,
    post_id = null,
  }) => {
    try {
      if (!receiver_id || !sender?.id) return;
      if (receiver_id === sender.id) return;

      const { error } = await supabase.from("notifications").insert({
        receiver_id,
        sender_id: sender.id,
        sender_name: sender.full_name || "Someone",
        type,
        message,
        post_id,
        read: false,
      });

      if (error) {
        console.error("Notification error:", error);
      }
    } catch (err) {
      console.error("Notification exception:", err);
    }
  };


  const likePost = async (postId) => {

    if (!me?.id || !postId) return;


    const post = posts.find((p) => p.id === postId);
    const postOwnerId = post?.user_id;


  await supabase.functions.invoke("send-notification", {
  body: {
    userId: postOwnerId,
    message: `${me.full_name} liked your post`,
  },
});

    if (!postOwnerId) return;

    const alreadyLiked = !!likedPosts[postId];

    // update UI first (your logic stays same)
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !alreadyLiked,
    }));

    // only send notification when LIKING (not unliking)
    if (!alreadyLiked) {

      await createNotification({
        receiver_id: postOwnerId,
        sender: {
          id: me.id,
          full_name: me.full_name,
        },
        type: "like",
        message: "liked your post",
        post_id: postId,
      });
      console.log("hi")
    }

  };

  /*  const likePost = async (post) => {
 
     if (!me?.id || !post.id) return;
 
     try {
       if (animatingLike === post.id) return;
 
       setAnimatingLike(post.id);
       setTimeout(() => setAnimatingLike(null), 400);
 
       const alreadyLiked = !!likedPosts[post.id];
 
 
       // ================= UI UPDATE =================
       const updatedPosts = posts.map((post) => {
         if (post.id === post.id) {
           return {
             ...post,
             likes_count: alreadyLiked
               ? Math.max(0, (post.likes_count || 0) - 1)
               : (post.likes_count || 0) + 1,
           };
         }
         return post;
       });
 
       setPosts(updatedPosts);
 
 
       // ================= LOCAL CACHE =================
       const updatedLikes = {
         ...likedPosts,
         [post.id]: !alreadyLiked,
       };
 
       setLikedPosts(updatedLikes);
 
       localStorage.setItem(
         "liked_posts_v1",
         JSON.stringify(updatedLikes)
       );
 
       // ================= OFFLINE QUEUE =================
       const pendingKey = "pending_likes";
       const pendingRaw = localStorage.getItem(pendingKey);
       const pending = pendingRaw ? JSON.parse(pendingRaw) : [];
 
       const action = alreadyLiked ? "unlike" : "like";
       const postId = post.id
       pending.push({
         postId,
         action,
         userId: me.id,
         timestamp: Date.now(),
       });
 
       localStorage.setItem(pendingKey, JSON.stringify(pending));
 
       // ================= NETWORK CHECK =================
       const online = navigator.onLine;
 
       if (!online) return;
 
       // ================= SYNC TO SUPABASE =================
       const { data: currentPost, error: fetchError } = await supabase
         .from("posts")
         .select("likes_count")
         .eq("id", post.id)
         .single();
 
 
       await createNotification({
         receiver_id: post.user_id,   // 👈 person who owns the post
         sender: me.id,               // 👈 person who liked
         type: "like",
         message: "liked your post",
         post_id: postId,
       });
 
 
       if (fetchError) {
         console.log(fetchError);
         return;
       }
 
       const currentLikes = currentPost?.likes_count || 0;
 
       const newLikes = alreadyLiked
         ? Math.max(0, currentLikes - 1)
         : currentLikes + 1;
 
       const { error } = await supabase
         .from("posts")
         .update({ likes_count: newLikes })
         .eq("id", post.id);
 
 
 
       if (error) {
         console.log("DB UPDATE ERROR:", error);
         return;
       }
 
       console.log("LIKE SYNCED:", postId, newLikes);
     } catch (err) {
       console.log("LIKE ERROR:", err);
     }
   }; */
  // ================= SHARE (WEB ONLY) =================

  const sharePost = async (post) => {
    try {
      if (!post?.id) {
        alert("Post not ready");
        return;
      }

      const postElement = document.getElementById(`post-${post.id}`);

      console.log("postElement:", postElement);

      if (!postElement) {
        alert("Post element not found in DOM");
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "share-post",
        {
          body: {
            postId: post.id,
            description: post.description,
          },
        }
      );

      if (error) throw error;

      const dataUrl = await toPng(postElement, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#0b001a",
      });

      const blob = await (await fetch(dataUrl)).blob();

      const file = new File([blob], "socialgist-post.png", {
        type: "image/png",
      });

      await navigator.share({
        title: data?.title || "SocialGist",
        text: data?.text || post.description,
        url: data?.shareUrl,
        files: [file],
      });

    } catch (err) {
      console.error("Share failed:", err);
    }
  };
  // ================= LOADING =================
  /* 
    if (loading) {
      return (
        <div className="h-screen bg-white dark:bg-[#0f0f10] flex flex-col items-center justify-center">
          <img
            src="/icon.png"
            className="w-24 h-24 animate-pulse"
          />
        </div>
      );
    } */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#0f0f10] pb-24">

        {/* TOP BAR SKELETON */}
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10">
          <div className="h-14 px-4 flex items-center justify-between">

            <div className="h-4 w-28 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />

            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
              <div className="h-10 w-20 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
            </div>

          </div>
        </div>

        {/* FEED HEADER SKELETON */}
        <div className="w-full max-w-2xl mx-auto p-4 space-y-4">

          {/* WELCOME CARD SKELETON */}
          <div className="rounded-3xl p-6 bg-gray-200 dark:bg-white/5 animate-pulse h-48" />

          {/* POST SKELETONS */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-3xl bg-white dark:bg-[#18191A] border border-gray-100 dark:border-white/5 p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
                <div className="flex-1">
                  <div className="h-3 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse mb-2" />
                  <div className="h-2 w-20 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                </div>
              </div>

              <div className="h-4 w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />

              <div className="h-40 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />

              <div className="flex gap-3 pt-2">
                <div className="h-10 flex-1 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
                <div className="h-10 flex-1 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
                <div className="h-10 flex-1 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f10] pb-24">
      {/* TOP */}
      <div className="px-3 pt-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">

          {[
            "all",
            "sports",
            "memes",
            "dating",
            "trading",
            "news",
            "academics",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
          flex-shrink-0
          px-5 py-2
          rounded-full
          text-sm font-medium
          capitalize
          transition-all duration-200
          border
          active:scale-95

          ${activeTab === tab
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50"
                }
        `}
            >
              {tab}
            </button>
          ))}

        </div>
      </div>
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-[#111]/80 border-b border-gray-200 dark:border-white/10">
        <div className="h-14 px-4 flex items-center justify-between">
          <h1 className="text-xl font-black bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            SocialGist
          </h1>

          <div className="flex items-center gap-3">
            {/* REFRESH */}

            <button
              onClick={() =>
                fetchPosts()
              }
              className="h-10 w-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center"
            >
              <RefreshCcw
                size={18}
                className={`${refreshing
                  ? "animate-spin"
                  : ""
                  }`}
              />
            </button>

            {/* NETWORK */}

            <div
              className={`flex items-center gap-2 px-3 h-10 rounded-full text-xs font-bold ${isOnline
                ? "bg-green-500/10 text-green-500"
                : "bg-red-500/10 text-red-500"
                }`}
            >
              {isOnline ? (
                <Wifi size={14} />
              ) : (
                <WifiOff size={14} />
              )}

              {isOnline
                ? "Online"
                : "Offline"}
            </div>
          </div>
        </div>
      </div>

      {/* FEED */}

      <div className="w-full max-w-2xl mx-auto p-2 sm:p-4">
        {/* WELCOME CARD */}

        <div className="mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-fuchsia-600 to-pink-500 p-6 shadow-2xl text-white relative">
          <div className="absolute top-0 right-0 opacity-10">
            <Sparkles size={150} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                <Flame size={28} />
              </div>

              <div>
                <h1 className="text-2xl font-black">
                  Welcome to
                  SocialGist
                </h1>

                <p className="text-sm text-white/80 mt-1">
                  Connect • Vibe •
                  Gist
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-white/90 mb-5">
              Share photos,
              thoughts, vibes,
              moments and connect
              with people in
              real-time.
            </p>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full backdrop-blur-xl">
                <Users size={16} />

                <span className="text-sm font-semibold">
                  Social Community
                </span>
              </div>

              <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-xl">
                <Sparkles size={16} />

                <span className="text-sm font-semibold">
                  Trending Vibes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* EMPTY */}

        {posts.length === 0 && (
          <div className="h-[60vh] flex items-center justify-center">
            <div className="text-center px-6">
              <img
                src="/icon.png"
                className="w-24 h-24 mx-auto opacity-70"
              />

              <h2 className="text-2xl font-black mt-6 text-gray-800 dark:text-white">
                No posts yet
              </h2>

              <p className="text-gray-500 mt-2">
                Be the first to post
              </p>
            </div>
          </div>
        )}

        {/* POSTS */}
        {posts.map((post) => {
          const parsed = post.content || {};

          return (
            <div
              id={`post-${post.id}`}
              key={post.id}
              className="bg-white dark:bg-[#18191A] mb-4 sm:rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition"
            >

              {/* ================= HEADER ================= */}
              <div className="flex items-center gap-3 px-4 py-4 relative">

                {/* CLICKABLE USER HEADER */}
                <div
                  onClick={() => openUserProfile(post.user_id)}
                  className="flex items-center gap-3 flex-1 cursor-pointer active:scale-[0.98] transition"
                >

                  {/* AVATAR */}
                  {profileImages[post.user_id] ? (
                    <img
                      src={profileImages[post.user_id]}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-purple-500"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm"
                    >
                      {(post.profile_name || "U").charAt(0).toUpperCase()}
                    </div>
                  )}


                  {/* USER INFO */}
                  <div className="min-w-0">

                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {post.profile_name || "Anonymous"}
                    </h3>

                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Globe size={12} />

                      <span>
                        {post.created_at
                          ? formatTimeAgo(post.created_at)
                          : "Just now"}
                      </span>

                    </div>

                  </div>

                </div>



                {/* 3 DOTS MENU */}
                <div className="relative">

                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      setOpenMenuId((prev) =>
                        prev === post.id ? null : post.id
                      );
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    <MoreVertical size={18} />
                  </button>


                  {openMenuId === post.id && (

                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="
        absolute right-0 mt-2 w-36
        bg-white dark:bg-[#222]
        shadow-lg rounded-xl overflow-hidden
        z-50 border border-gray-100 dark:border-white/10
        "
                    >

                      <button
                        onClick={() => {
                          sharePost(post, post.id);
                          setOpenMenuId(null);
                        }}
                        className="
          w-full text-left px-4 py-2 text-sm
          hover:bg-gray-100 dark:hover:bg-white/5
          "
                      >
                        Share
                      </button>


                      <button
                        onClick={() => {
                          deletePost(post.id);
                          setOpenMenuId(null);
                        }}
                        className="
          w-full text-left px-4 py-2 text-sm text-red-500
          hover:bg-red-50 dark:hover:bg-red-500/10
          "
                      >
                        Delete
                      </button>


                    </div>

                  )}

                </div>


              </div>

              {/* ================= DESCRIPTION ================= */}
              {post.description && (
                <div className="px-4 pb-3">
                  <p className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
                    {post.description}
                  </p>
                </div>
              )}

              {/* ================= IMAGE ================= */}
              {post.image && (
                <div className="relative w-full bg-black overflow-hidden">

                  <img
                    src={post.cached_image || post.image}
                    className="w-full max-h-[420px] object-contain bg-black"
                  />

                  {parsed?.layers?.map((layer) => (
                    <div
                      key={layer.id}
                      className="absolute px-2 py-1 font-bold"
                      style={{
                        left: layer.x,
                        top: layer.y,
                        color: layer.color,
                        fontSize: layer.fontSize,
                        textShadow: "0 2px 6px rgba(0,0,0,0.6)",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {layer.text}
                    </div>
                  ))}

                </div>
              )}

              {/* ================= TEXT POST ================= */}
              {!post.image && parsed?.background && (
                <div
                  className="relative w-full min-h-[380px] flex items-center justify-center px-6 py-12"
                  style={{ background: parsed.background }}
                >
                  {parsed?.text ? (
                    <div className="text-white text-center font-extrabold text-3xl leading-snug max-w-[90%]">
                      {parsed.text}
                    </div>
                  ) : (
                    parsed?.layers?.map((layer) => (
                      <div
                        key={layer.id}
                        className="absolute px-2 py-1 font-bold"
                        style={{
                          left: layer.x,
                          top: layer.y,
                          color: layer.color,
                          fontSize: layer.fontSize,
                          textShadow: "0 2px 6px rgba(0,0,0,0.6)",
                        }}
                      >
                        {layer.text}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ================= ACTION BAR ================= */}
              <div className="px-4 py-3">

                <div className="flex items-center justify-between mb-3">

                  <div className="flex items-center gap-5">

                    <div className="flex items-center gap-1">
                      <Heart size={20} className="text-red-500" fill="currentColor" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {post.likes_count || 0}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-semibold">
                        {post.comments_count || 0}
                      </span>{" "}
                      comments
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-semibold">
                        {post.shares_count || 0}
                      </span>{" "}
                      shares
                    </div>

                  </div>

                  <div className="text-xs font-semibold text-purple-600">
                    SocialGist
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-white/5 pt-3">

                  <button
                    onClick={() => likePost(post.id)}
                    className={`
    flex items-center justify-center gap-2 h-11 rounded-2xl
    transition-all active:scale-95
    ${likedPosts?.[post.id]
                        ? "text-blue-500 bg-blue-500/10"
                        : "hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200"
                      }
  `}
                  >
                    <ThumbsUp
                      size={18}
                      className={`
      transition-all duration-200
      ${animatingLike === post.id ? "scale-150 rotate-12 text-blue-500" : ""}
    `}
                      fill={likedPosts?.[post.id] ? "currentColor" : "none"}
                    />

                    <span className="text-sm font-semibold">Like</span>
                  </button>
                  <button
                    onClick={() => {
                      openComments(post);
                      setActivePost(post);
                      setComments(post.comments || []);
                      setOpen(true);
                    }}
                    className="
    flex items-center justify-center gap-2
    h-11 rounded-2xl
    text-gray-700
    dark:text-white
    hover:bg-gray-100
    dark:hover:bg-white/5
    transition
  "
                  >
                    <MessageCircle
                      size={18}
                      className="text-gray-700 dark:text-white"
                    />

                    <span>
                      Comment
                    </span>
                  </button>
                  <button
                    onClick={() => sharePost(post, post.id)}
                    className="flex items-center justify-center gap-2 h-11 rounded-2xl bg-purple-500/10 text-purple-600"
                  >
                    <BiShare size={18} className="rotate-180" />
                    Share
                  </button>

                </div>

              </div>
            </div>
          );
        })}

        {
          loadingMore && (
            <div className="py-8 flex justify-center">
              <RefreshCcw
                size={24}
                className="animate-spin text-purple-600"
              />
            </div>
          )
        }


        {/* COMMENTS BOTTOM SHEET */}
        {open && (
          <div className="fixed inset-0 z-50">

            {/* BACKDROP */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* SHEET */}
            <div className="absolute bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-[28px] shadow-[0_-20px_60px_rgba(0,0,0,0.2)] flex flex-col animate-slideUp">

              {/* HANDLE */}
              <div className="flex justify-center py-3">
                <div className="w-14 h-1.5 rounded-full bg-gray-300" />
              </div>

              {/* HEADER */}
              <div className="px-5 pb-4 border-b border-gray-100 flex items-center justify-between">

                <div>
                  <h2 className="font-bold text-lg text-gray-900">
                    Comments
                  </h2>
                  <p className="text-xs text-gray-500">
                    {activePost?.comments?.length || comments.length || 0} comments
                  </p>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                >
                  ✕
                </button>
              </div>

              {/* COMMENTS */}
              <div className="flex-1 overflow-y-auto p-4">

                {/* PREMIUM SKELETON */}
                {loadingcomment && (
                  <div className="space-y-6">

                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="flex gap-3 animate-pulse"
                      >
                        {/* Avatar */}
                        <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />

                        {/* Content */}
                        <div className="flex-1">

                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-3 w-24 rounded-full bg-gray-200" />
                            <div className="h-2 w-10 rounded-full bg-gray-100" />
                          </div>

                          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                            <div className="h-3 w-full rounded-full bg-gray-200" />
                            <div className="h-3 w-5/6 rounded-full bg-gray-200" />
                            <div className="h-3 w-2/3 rounded-full bg-gray-100" />
                          </div>

                        </div>
                      </div>
                    ))}

                  </div>
                )}


                {/* EMPTY STATE */}
                {!loadingcomment && comments.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center">

                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
                      <MessageSquare size={28} className="text-purple-600" />
                    </div>

                    <h3 className="mt-4 font-semibold text-gray-900">
                      No comments yet
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Be the first person to comment.
                    </p>

                  </div>
                )}

                {/* COMMENTS */}
                {!loadingcomment &&
                  comments.map((c) => (
                    <div
                      key={c.id}
                      className="flex gap-3 py-3 border-b border-gray-100 last:border-none"
                    >
                      {/* USER AVATAR */}
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-violet-600 text-white flex items-center justify-center font-semibold text-sm"
                        onClick={() => openUserProfile(activePost.user_id)}
                      >
                        {c.avatar ? (
                          <img
                            src={c.avatar}
                            alt={c.user}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (c.user?.[0] || "U").toUpperCase()
                        )}
                      </div>

                      <div className="flex-1">

                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-900">
                            {c.user}
                          </span>

                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(c.created_at)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                          {c.text}
                        </p>

                      </div>

                    </div>
                  ))}
              </div>

              {/* INPUT */}
              <div className="border-t border-gray-100 p-4">

                <div className="flex items-center gap-2">

                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addCommentToPost({
                          postId: activePost?.id,
                          commentText,
                          me,
                          setComments,
                          setCommentText,
                        });
                      }
                    }}
                    placeholder="Write a comment..."
                    className="flex-1 h-12 px-4 rounded-full border border-gray-200 bg-gray-50 text-sm outline-none focus:border-purple-400 focus:bg-white transition"
                  />



                  <button
                    onClick={() => addCommentToPost(activePost)}
                    className="
    h-12
    px-5
    rounded-full
    bg-gradient-to-r
    from-purple-600
    to-violet-600
    text-white
    font-medium
    shadow-lg
    hover:scale-105
    active:scale-95
    transition
    flex
    items-center
    justify-center
  "
                  >
                    <Send size={18} />
                  </button>

                </div>

              </div>

            </div>
          </div>
        )}
      </div>

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={profileData}
        isFollowing={
          profileData
            ? followingIds.includes(profileData.id)
            : false
        }
        onFollowToggle={toggleFollow}
        currentUserProfileId={profileId}
      />

    </div >
  );
}
