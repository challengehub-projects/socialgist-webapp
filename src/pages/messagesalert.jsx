import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import { supabase } from "../configs/supbase";
import { sendNotification } from "../utils/sendNotifications";
import {
    initNotifications,
    showNotification,
} from "../utils/notifications";

import {
    ArrowLeft,
    Send,
    LogOut,
    Search,
    MoreVertical,
} from "lucide-react";


import {
    getOrCreateConversation,
} from "../utils/uilts";
import { Capacitor } from "@capacitor/core";
import { isOnline, saveMessage, getLocalMessages, syncConversation } from "../utils/chatSync";

export default function Messages({
    onBack,
    post,
}) {



    const messagesEndRef =
        useRef(null);

    const typingTimeoutRef =
        useRef(null);

    const channelRef =
        useRef(null);

    const isOpeningChatRef = useRef(false);

    const [me, setMe] =
        useState(null);

    const [chats, setChats] =
        useState([]);

    const [activeChat, setActiveChat] =
        useState(null);

    const [messages, setMessages] =
        useState([]);

    const [text, setText] =
        useState("");

    const [sending, setSending] =
        useState(false);

    const [mobileChatOpen, setMobileChatOpen] =
        useState(false);

    const [typingUsers, setTypingUsers] =
        useState([]);

    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);


    // ================= SCROLL =================

    const scrollToBottom = () => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });

    };

    useEffect(() => {
        if (!me?.id) return;

        const channel = supabase
            .channel(`incoming-${me.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `sender_id=neq.${me.id}`, // 👈 important fix
                },
                async (payload) => {
                    const msg = payload.new;

                    // ignore own messages
                    if (msg.sender_id === me.id) return;

                    // mobile notification
                    if (Capacitor.isNativePlatform()) {
                        await showNotification(
                            "New Message",
                            msg.content
                        );
                    }
                    // web notification
                    else {
                        await sendNotification({
                            title: "New Message",
                            body: msg.content,
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [me?.id]);



    useEffect(() => {

        scrollToBottom();

    }, [messages, typingUsers]);

    // ================= USER =================

    useEffect(() => {

        const initUser = async () => {

            const { data } =
                await supabase.auth.getUser();

            setMe(data?.user || null);

        };

        initUser();

    }, []);

    useEffect(() => {
        if (!me?.id) return;

        const channel = supabase
            .channel(`notifications-${me.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                },
                async (payload) => {
                    const message = payload.new;

                    // ignore own messages
                    if (message.sender_id === me.id) return;

                    // CHAT CURRENTLY OPEN
                    if (
                        activeChat?.conversation_id ===
                        message.conversation_id
                    ) {
                        // instantly mark read
                        await supabase
                            .from("messages")
                            .update({
                                is_read: true,
                            })
                            .eq("id", message.id);

                        setMessages((prev) => {
                            if (
                                prev.some(
                                    (m) => m.id === message.id
                                )
                            ) {
                                return prev;
                            }

                            return [...prev, message];
                        });

                        // force unread badge = 0
                        setChats((prev) =>
                            prev.map((chat) =>
                                chat.conversation_id ===
                                    message.conversation_id
                                    ? {
                                        ...chat,
                                        unreadCount: 0,
                                    }
                                    : chat
                            )
                        );

                        return;
                    }

                    // CHAT CLOSED
                    setChats((prev) =>
                        prev.map((chat) =>
                            chat.conversation_id ===
                                message.conversation_id
                                ? {
                                    ...chat,
                                    unreadCount:
                                        (chat.unreadCount || 0) + 1,
                                    lastMessage:
                                        message.content,
                                }
                                : chat
                        )
                    );

                    if (Capacitor.isNativePlatform()) {
                        await showNotification(
                            "New Message",
                            message.content
                        );
                    } else {
                        await sendNotification({
                            title: "New Message",
                            body: message.content,
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [
        me?.id,
        activeChat?.conversation_id,
    ]);


    useEffect(() => {

        const startChat = async (
            post
        ) => {

            console.log(
                "Starting chat with post",
                post
            );

            if (
                !me?.id ||
                !post?.user_id
            ) {
                return;
            }

            // DON'T CHAT WITH YOURSELF

            if (
                me.id ===
                post.user_id
            ) {
                return;
            }

            const result =
                await getOrCreateConversation(
                    me.id,
                    post.user_id,
                    post.profile_name
                );

            if (!result) {
                return;
            }

            const chat = {

                conversation_id:
                    result.conversationId,

                user_id:
                    post.user_id,

                name:
                    post.profile_name ||
                    "User",

                profile_image:
                    post.profile_image,

            };

            if (
                Capacitor.isNativePlatform()
            ) {

                await showNotification(
                    "Message",
                    "New Chat Created"
                );

            } else {

                await sendNotification({

                    title:
                        "Message",

                    body:
                        "New Chat Created",

                });

            }

            setActiveChat(
                chat
            );

            setMobileChatOpen(
                true
            );

            await loadMessages(
                result.conversationId
            );

            /*      setupTyping(
                   result.conversationId
                 ); */

        };

        startChat(post);

    }, [me, post]);

    // ================= SIGN OUT =================

    const signOut = async () => {

        await supabase.auth.signOut();

        window.location.reload();

    };

    // utils/getUnreadMessagesCount.js

    const formatTime = (date) => {

        if (!date) return "";

        return new Date(date).toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    const loadChats = async (userId) => {
        const { data, error } = await supabase
            .from("conversation_members")
            .select("conversation_id")
            .eq("user_id", userId);

        if (error) {
            console.log(error);
            return;
        }

        const chats = await Promise.all(
            (data || []).map(async (item) => {
                const conversationId =
                    item.conversation_id;

                const [
                    unreadResult,
                    membersResult,
                    lastMessageResult,
                ] = await Promise.all([
                    supabase
                        .from("messages")
                        .select("*", {
                            count: "exact",
                            head: true,
                        })
                        .eq(
                            "conversation_id",
                            conversationId
                        )
                        .neq(
                            "sender_id",
                            userId
                        )
                        .eq(
                            "is_read",
                            false
                        ),

                    supabase
                        .from(
                            "conversation_members"
                        )
                        .select(
                            "user_id, full_name"
                        )
                        .eq(
                            "conversation_id",
                            conversationId
                        ),

                    supabase
                        .from("messages")
                        .select("*")
                        .eq(
                            "conversation_id",
                            conversationId
                        )
                        .order(
                            "created_at",
                            {
                                ascending: false,
                            }
                        )
                        .limit(1)
                        .maybeSingle(),
                ]);

                const otherMember =
                    membersResult.data?.find(
                        (m) =>
                            m.user_id !== userId
                    );

                if (!otherMember)
                    return null;

                return {
                    conversation_id:
                        conversationId,
                    user_id:
                        otherMember.user_id,
                    name:
                        otherMember.full_name ||
                        "Unknown User",
                    avatar: null,
                    lastMessage:
                        lastMessageResult.data
                            ?.content ||
                        "Start chatting",
                    unreadCount:
                        unreadResult.count || 0,
                };
            })
        );

        setChats(
            chats.filter(Boolean)
        );

        setLoadingChats(false);
    };

    const loadMessages = async (
        conversationId
    ) => {


        setLoadingMessages(true);

        try {


            // MARK READ FIRST
            await supabase
                .from("messages")
                .update({
                    is_read: true,
                })
                .eq(
                    "conversation_id",
                    conversationId
                )
                .neq(
                    "sender_id",
                    me.id
                )
                .eq(
                    "is_read",
                    false
                );

            // WEB
            if (
                !Capacitor.isNativePlatform()
            ) {

                const {
                    data,
                    error,
                } = await supabase
                    .from("messages")
                    .select("*")
                    .eq(
                        "conversation_id",
                        conversationId
                    )
                    .order(
                        "created_at",
                        {
                            ascending: true,
                        }
                    );

                if (error) {
                    console.log(error);
                    return;
                }

                setMessages(
                    data || []
                );

                return;
            }

            // MOBILE

            const local =
                await getLocalMessages(
                    conversationId
                );

            if (
                local?.length
            ) {

                setMessages(
                    local.sort(
                        (a, b) =>
                            new Date(
                                a.created_at
                            ) -
                            new Date(
                                b.created_at
                            )
                    )
                );

            }

            await syncConversation(
                conversationId
            );

            const updated =
                await getLocalMessages(
                    conversationId
                );

            const finalMessages =
                (updated || [])
                    .map((msg) => ({
                        ...msg,
                        is_read: true,
                    }))
                    .sort(
                        (a, b) =>
                            new Date(
                                a.created_at
                            ) -
                            new Date(
                                b.created_at
                            )
                    );

            setMessages(
                finalMessages
            );

        } catch (err) {

            console.log(
                "loadMessages error:",
                err
            );

        } finally {
            setLoadingMessages(false);
        }
    };

    // ================= START =================

    useEffect(() => {
        if (me?.id) {
            loadChats(me.id);
        }
    }, [me]);


    // ================= OPEN CHAT =================

    const clearUnread = async (conversationId, userId) => {
        await supabase
            .from("messages")
            .update({ is_read: true })
            .eq("conversation_id", conversationId)
            .neq("sender_id", userId)
            .eq("is_read", false);
    };

    const openChat = async (chat) => {
        if (isOpeningChatRef.current) return;
        isOpeningChatRef.current = true;

        try {
            setActiveChat(chat);
            setMobileChatOpen(true);

            // 1. MARK AS READ
            const { data: updatedRows, error } = await supabase
                .from("messages")
                .update({ is_read: true })
                .eq("conversation_id", chat.conversation_id)
                .neq("sender_id", me.id)
                .eq("is_read", false)
                .select();

            console.log(
                "MARKED READ:",
                updatedRows?.length,
                error
            );
            // 1. MARK AS READ (DB ONLY SOURCE OF TRUTH)
            await supabase
                .from("messages")
                .update({ is_read: true })
                .eq("conversation_id", chat.conversation_id)
                .neq("sender_id", me.id)
                .eq("is_read", false);

            // 2. REFRESH LIST
            await Promise.all([
                loadChats(me.id),
                loadMessages(chat.conversation_id),
            ]);

            setChats((prev) =>
                prev.map((c) =>
                    c.conversation_id === chat.conversation_id
                        ? { ...c, unreadCount: 0 }
                        : c
                )
            );

            // 3. LOAD MESSAGES
            await loadMessages(chat.conversation_id);

            // 4. CLEAN OLD CHANNEL FIRST (IMPORTANT FIX)
            if (channelRef.current) {
                await supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }

            // 5. CREATE NEW CHANNEL
            const channel = supabase.channel(`chat-${chat.conversation_id}`);

            channel.on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `conversation_id=eq.${chat.conversation_id}`,
                },
                async (payload) => {
                    const msg = payload.new;

                    if (Capacitor.isNativePlatform()) {
                        await saveMessage(msg);
                    }

                    if (msg.sender_id !== me.id) {
                        await supabase
                            .from("messages")
                            .update({ is_read: true })
                            .eq("id", msg.id);

                        const unreadCount = await getUnreadCount(
                            chat.conversation_id,
                            me.id
                        );

                        setChats((prev) =>
                            prev.map((c) =>
                                c.conversation_id === chat.conversation_id
                                    ? { ...c, unreadCount }
                                    : c
                            )
                        );
                    }

                    setMessages((prev) => {
                        if (prev.some((m) => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });
                }
            );

            // 6. SUBSCRIBE LAST
            await channel.subscribe();

            channelRef.current = channel;
        } finally {
            isOpeningChatRef.current = false;
        }
    };

    // ================= SEND TYPING =================

    const sendTyping = async () => {

        if (
            !channelRef.current ||
            !me
        ) {
            return;
        }

        try {

            await channelRef.current.send({

                type: "broadcast",

                event: "typing",

                payload: {
                    userId: me.id,
                },

            });

        } catch (err) {

            console.log(err);

        }

    };

    // ================= SEND =================

    const send = async () => {

        if (
            !text.trim() ||
            !activeChat
        )
            return;

        setSending(true);

        const tempId =
            crypto.randomUUID();

        const optimistic = {

            id: tempId,

            sender_id: me.id,

            content: text,

            created_at:
                new Date().toISOString(),

            conversation_id:
                activeChat.conversation_id,

            status: "sending",

        };

        if (Capacitor.isNativePlatform) {

            await showNotification(
                "Message Sent",
                text
            )

        }

        else {

            await sendNotification({

                title:
                    "Message Sent",

                body:
                    text,

            });

        }

        setMessages((prev) => [
            ...prev,
            optimistic,
        ]);

        const messageText = text;

        setText("");

        const {
            data,
            error,
        } = await supabase

            .from("messages")

            .insert({

                conversation_id:
                    activeChat.conversation_id,

                sender_id: me.id,

                content: messageText,

            })

            .select()

            .single();

        if (!error && data) {

            await saveMessage(
                data
            );

            setMessages((prev) =>
                prev.map((m) =>
                    m.id === tempId
                        ? data
                        : m
                )
            );
        }

        setSending(false);
    };


    return (
        <div className="h-screen flex overflow-hidden bg-white dark:bg-[#0f0f10]">

            {/* SIDEBAR */}

            <div
                className={`w-full md:w-[360px] border-r border-gray-200 dark:border-white/10 flex flex-col bg-white dark:bg-[#111] ${mobileChatOpen
                    ? "hidden md:flex"
                    : "flex"
                    }`}
            >

                {/* TOP */}

                <div className="px-4 pt-6 pb-4 border-b border-gray-200 dark:border-white/10">

                    <div className="flex justify-between items-center mb-4">

                        <div className="flex items-center gap-3">

                            <button
                                onClick={onBack}
                                className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center"
                            >

                                <ArrowLeft size={20} />

                            </button>

                            <h1 className="text-2xl font-black dark:text-white">
                                Messages
                            </h1>

                        </div>

                        <button
                            onClick={signOut}
                            className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center dark:text-white"
                        >

                            <LogOut size={18} />

                        </button>

                    </div>

                    {/* SEARCH */}

                    <div className="h-11 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center px-3">

                        <Search
                            size={16}
                            className="text-gray-500"
                        />

                        <input
                            className="ml-2 bg-transparent flex-1 outline-none text-sm dark:text-white"
                            placeholder="Search chats"
                        />

                    </div>

                </div>

                {/* CHATS */}

                <div className="flex-1 overflow-y-auto">
                    {loadingChats ? (
                        <div className="p-4 space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="flex gap-3 animate-pulse"
                                >
                                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-white/10" />

                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-1/2 bg-gray-200 dark:bg-white/10 rounded" />
                                        <div className="h-2 w-3/4 bg-gray-200 dark:bg-white/10 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (

                        chats.map((chat) => (

                            <button
                                key={
                                    chat.conversation_id
                                }
                                onClick={() =>
                                    openChat(chat)
                                }
                                className="w-full flex gap-3 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                            >
                                {chat.avatar ? (
                                    <img
                                        src={chat.avatar}
                                        alt=""
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white flex items-center justify-center font-bold">
                                        {chat.name
                                            ?.charAt(0)
                                            ?.toUpperCase()}
                                    </div>
                                )}

                                <div className="text-left flex-1 min-w-0 flex justify-between items-center gap-2">

                                    <div className="min-w-0 flex-1">

                                        <div className="font-semibold dark:text-white truncate">

                                            {chat.name}

                                        </div>

                                        <div className="text-sm text-gray-500 truncate">

                                            {chat.lastMessage}

                                        </div>

                                    </div>

                                    {chat.unreadCount > 0 && (

                                        <div className="h-6 min-w-[24px] px-2 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">

                                            {chat.unreadCount}

                                        </div>

                                    )}

                                </div>

                            </button>
                        ))
                    )}
                </div>

            </div>

            {/* CHAT */}

            <div
                className={`flex-1 flex flex-col bg-[#f5f7fb] dark:bg-[#0f0f10] ${mobileChatOpen
                    ? "flex"
                    : "hidden md:flex"
                    }`}
            >

                {!activeChat ? (
                    loadingChats ? (
                        // ================= SKELETON (NO CHAT SELECTED) =================
                        <div className="m-auto w-full max-w-md space-y-4 px-6 animate-pulse text-center">
                            <div className="h-6 w-40 bg-gray-200 dark:bg-white/10 rounded mx-auto" />
                            <div className="h-4 w-60 bg-gray-200 dark:bg-white/10 rounded mx-auto" />
                        </div>
                    ) : (
                        // ================= EMPTY STATE =================
                        <div className="m-auto text-gray-400 text-center px-6">
                            <h2 className="text-2xl font-black mb-2">Open a chat</h2>
                            <p>Start messaging on SocialGist</p>
                        </div>
                    )
                ) : (
                    <>
                        {/* HEADER */}
                        <div className="bg-white dark:bg-[#111] border-b border-gray-200 dark:border-white/10 px-4 py-3 flex justify-between items-center">
                            <div className="flex items-center gap-3">

                                <button
                                    onClick={() => setMobileChatOpen(false)}
                                    className="md:hidden h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center dark:text-white"
                                >
                                    <ArrowLeft size={20} />
                                </button>

                                <div>
                                    <div className="font-bold dark:text-white">
                                        {activeChat.name}
                                    </div>

                                    {typingUsers.length > 0 ? (
                                        <div className="text-xs text-green-500 italic">
                                            typing...
                                        </div>
                                    ) : (
                                        <div className="text-xs text-green-500">
                                            Active now
                                        </div>
                                    )}
                                </div>

                            </div>

                            <button className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center dark:text-white">
                                <MoreVertical size={18} />
                            </button>
                        </div>

                        {/* MESSAGES */}
                        <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-2">

                            {loadingMessages ? (
                                // ================= MESSAGE SKELETON =================
                                <div className="space-y-3 animate-pulse">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div
                                            key={i}
                                            className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
                                        >
                                            <div className="h-10 w-40 bg-gray-200 dark:bg-white/10 rounded-2xl" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                messages.map((m) => {
                                    const isMe = m.sender_id === me?.id;

                                    return (
                                        <div
                                            key={m.id}
                                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                        >
                                            <div className="max-w-[75%] flex flex-col">

                                                <div
                                                    className={`px-4 py-2.5 text-[14px] rounded-[22px] shadow-sm ${isMe
                                                        ? "bg-purple-600 text-white"
                                                        : "bg-white dark:bg-[#1b1b1d] border border-gray-200 dark:border-white/5 text-black dark:text-white"
                                                        }`}
                                                >
                                                    {m.content}
                                                </div>

                                                <div
                                                    className={`text-[10px] mt-1 text-gray-500 ${isMe ? "text-right" : "text-left"
                                                        }`}
                                                >
                                                    {formatTime(m.created_at)}
                                                </div>

                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* INPUT */}
                        <div className="bg-white dark:bg-[#111] border-t border-gray-200 dark:border-white/10 p-3 flex gap-2">

                            <input
                                value={text}
                                onChange={(e) => {
                                    setText(e.target.value);
                                    sendTyping();
                                }}
                                className="flex-1 bg-gray-100 dark:bg-white/5 rounded-full px-4 py-3 outline-none dark:text-white"
                                placeholder="Message..."
                            />

                            <button
                                onClick={send}
                                disabled={sending}
                                className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white flex items-center justify-center active:scale-95 transition disabled:opacity-50"
                            >
                                <Send size={18} />
                            </button>

                        </div>
                    </>
                )}
            </div>
        </div>
    );
}