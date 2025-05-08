"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Header from "@/components/header";
import { AppSidebar } from "@/components/hotels/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MessageSquareText,
  Send,
  Loader2,
  Bot,
  Plus,
  MessageCircleQuestion,
  CalendarPlus,
  Tags,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  hotelId: string;
  messages?: Message[];
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

const CHAT_SESSION_KEY = "chatbot_session";

// Xử lý sự kiện đăng xuất để xóa chatbot_session
if (typeof window !== "undefined") {
  document.addEventListener("signOut", () => {
    localStorage.removeItem(CHAT_SESSION_KEY);
  });
}

export default function ChatbotPlaygroundPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lấy thông tin phiên chat từ localStorage khi component mount
  useEffect(() => {
    const storedSession = localStorage.getItem(CHAT_SESSION_KEY);
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        setChatSession(session);
        fetchChatHistory(session.id);
      } catch (error) {
        console.error("Lỗi khi đọc dữ liệu phiên chat:", error);
        localStorage.removeItem(CHAT_SESSION_KEY);
      }
    }
  }, []);

  // Xóa phiên chat khi người dùng đăng xuất
  useEffect(() => {
    if (status === "unauthenticated" && chatSession) {
      clearChatSession();
    }
  }, [status]);

  // Cuộn xuống dưới khi có tin nhắn mới
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus vào input khi mở chat
  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatOpen]);

  // Lấy lịch sử chat
  const fetchChatHistory = async (chatId: string) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/chatbot/history/${chatId}`);

      if (response.data && response.data.messages) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử chat:", error);
      toast.error("Không thể lấy lịch sử chat. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Tạo phiên chat mới
  const createChatSession = async () => {
    console.log(session);
    if (status !== "authenticated" || !session?.user) {
      toast.error("Bạn cần đăng nhập để sử dụng chatbot");
      return;
    }

    try {
      setIsCreatingSession(true);

      const hotelId = params.id as string;
      const response = await axiosInstance.post("/chatbot/sessions", {
        userId: session.user.id,
        userName: session.user.name,
        hotelId: hotelId,
      });

      if (response.data) {
        const newSession = response.data;
        setChatSession(newSession);
        localStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(newSession));
        setIsChatOpen(true);
        toast.success("Đã tạo đoạn chat mới");
      }
    } catch (error) {
      console.error("Lỗi khi tạo phiên chat:", error);
      toast.error("Không thể tạo phiên chat. Vui lòng thử lại sau.");
    } finally {
      setIsCreatingSession(false);
    }
  };

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !chatSession) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/chatbot/messages", {
        chatId: chatSession.id,
        message: inputValue,
      });

      if (response.data) {
        const botMessage: Message = {
          role: "assistant",
          content: response.data.message,
          timestamp: response.data.timestamp,
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      toast.error("Không thể gửi tin nhắn. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Đóng/mở chat
  const toggleChat = () => {
    if (!isChatOpen && !chatSession) {
      // Nếu chưa có phiên chat, tạo phiên chat mới
      createChatSession();
    } else {
      setIsChatOpen(!isChatOpen);
    }
  };

  // Xóa phiên chat (logout)
  const clearChatSession = () => {
    localStorage.removeItem(CHAT_SESSION_KEY);
    setChatSession(null);
    setMessages([]);
    setIsChatOpen(false);
    toast.info("Đã xóa phiên chat");
  };

  const isAuthenticated = status === "authenticated" && session?.user;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Chatbot AI</BreadcrumbPage>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Thử nghiệm</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col p-6 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold tracking-tight">
                Thử nghiệm Chatbot AI
              </h2>
              <div className="flex gap-2 mt-2 sm:mt-0">
                {chatSession ? (
                  <Button variant="outline" onClick={clearChatSession}>
                    Xóa phiên chat
                  </Button>
                ) : (
                  <Button
                    onClick={createChatSession}
                    disabled={isCreatingSession || !isAuthenticated}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isCreatingSession ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo phiên chat
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <Card className="overflow-hidden p-0 mt-4">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-6 w-6 text-primary" />
                  Chatbot AI
                </CardTitle>
                <CardDescription>
                  Thử nghiệm trò chuyện với Chatbot AI để hỗ trợ khách hàng
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  <p>
                    Chatbot AI giúp bạn tự động hóa việc trả lời các câu hỏi
                    thường gặp của khách hàng. Bạn có thể thử nghiệm trò chuyện
                    với Chatbot bằng cách nhấn vào nút Chatbot ở góc phải màn
                    hình.
                  </p>
                  {!isAuthenticated && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-900/50">
                      <p className="text-yellow-800 dark:text-yellow-200">
                        Bạn cần đăng nhập để sử dụng tính năng Chatbot AI.
                      </p>
                    </div>
                  )}
                  <p>Một số chức năng chính của Chatbot:</p>
                  <ul className="list-disc pl-6 space-y-3">
                    <li className="flex items-start gap-2">
                      <MessageCircleQuestion className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Trả lời các câu hỏi về dịch vụ khách sạn</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CalendarPlus className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Hỗ trợ đặt phòng</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Tags className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Cung cấp thông tin về giá cả và khuyến mãi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Giải đáp thắc mắc về các tiện ích</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Floating Chat Button */}
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={toggleChat}
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 ease-out hover:scale-110 active:scale-100 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!isAuthenticated}
            >
              <MessageSquareText className="h-6 w-6" />
            </Button>
          </div>

          {/* Chat Dialog */}
          <div
            className={cn(
              "fixed bottom-24 right-6 z-50 w-80 sm:w-96 transition-all duration-300 ease-out transform",
              isChatOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0 pointer-events-none",
            )}
          >
            <Card className="shadow-lg border-2 p-0 gap-0">
              <CardHeader className="bg-slate-50 dark:bg-slate-900/50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/images/bot-avatar.png" alt="AI" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">Chatbot AI</CardTitle>
                      <CardDescription className="text-xs">
                        Trợ lý ảo
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={toggleChat}
                  >
                    &times;
                  </Button>
                </div>
              </CardHeader>
              <ScrollArea className="h-100">
                <CardContent className="p-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <Bot className="h-16 w-16 text-primary mb-3" />
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Xin chào
                        {session?.user?.name ? ` ${session.user.name}` : ""}!
                        Tôi là trợ lý ảo của khách sạn. Bạn cần hỗ trợ gì?
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex",
                            message.role === "user"
                              ? "justify-end"
                              : "justify-start",
                          )}
                        >
                          {message.role === "assistant" && (
                            <Avatar className="h-8 w-8 mr-2 mt-1">
                              <AvatarImage
                                src="/images/bot-avatar.png"
                                alt="AI"
                              />
                              <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={cn(
                              "max-w-[70%] rounded-xl p-3 break-words overflow-hidden",
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-gray-100 dark:bg-gray-800",
                            )}
                          >
                            <div className="markdown-content whitespace-pre-wrap text-sm break-words overflow-hidden">
                              <div
                                className={cn(
                                  "prose prose-sm max-w-none overflow-hidden",
                                  message.role === "user" ? "prose-invert" : "",
                                  "prose-headings:my-2 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5",
                                  "prose-img:my-2 prose-img:rounded-md prose-img:max-h-60",
                                  "prose-pre:bg-gray-200 prose-pre:dark:bg-gray-800 prose-pre:p-2 prose-pre:rounded-md",
                                )}
                              >
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeRaw]}
                                  components={{
                                    img: (props) => (
                                      <img
                                        src={props.src}
                                        className="max-w-full h-auto rounded-md my-2"
                                        loading="lazy"
                                        alt={props.alt || "Hình ảnh"}
                                      />
                                    ),
                                    a: (props) => (
                                      <a
                                        href={props.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline break-all"
                                      >
                                        {props.children}
                                      </a>
                                    ),
                                    pre: (props) => (
                                      <div className="overflow-x-auto max-w-full">
                                        <pre {...props} />
                                      </div>
                                    ),
                                    code: ({
                                      className,
                                      children,
                                      ...props
                                    }) => {
                                      const match = /language-(\w+)/.exec(
                                        className || "",
                                      );
                                      const isInline = !match;

                                      return isInline ? (
                                        <code
                                          className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded text-xs"
                                          {...props}
                                        >
                                          {children}
                                        </code>
                                      ) : (
                                        <pre className="overflow-x-auto w-full">
                                          <code
                                            className="block bg-gray-200 dark:bg-gray-800 p-2 rounded text-xs"
                                            {...props}
                                          >
                                            {children}
                                          </code>
                                        </pre>
                                      );
                                    },
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            </div>
                            <p className="text-xs opacity-70 mt-1 text-right">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          {message.role === "user" && (
                            <Avatar className="h-8 w-8 ml-2 mt-1">
                              <AvatarFallback>
                                {session?.user?.name
                                  ?.substring(0, 2)
                                  .toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage
                              src="/images/bot-avatar.png"
                              alt="AI"
                            />
                            <AvatarFallback>AI</AvatarFallback>
                          </Avatar>
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                                style={{ animationDelay: "0ms" }}
                              ></div>
                              <div
                                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              ></div>
                              <div
                                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                                style={{ animationDelay: "600ms" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </CardContent>
              </ScrollArea>
              <div className="p-4 border-t">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                    disabled={isLoading || !chatSession}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
                    disabled={!inputValue.trim() || isLoading || !chatSession}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
