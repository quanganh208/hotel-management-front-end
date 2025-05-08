"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquareText,
  Eye,
  Loader2,
  Bot,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

interface Message {
  _id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatSession {
  _id: string;
  userId: string;
  userName: string;
  hotelId: string;
  messages: Message[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ChatHistoryPage() {
  const params = useParams();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [error, setError] = useState<string | null>(null);

  // Lấy dữ liệu lịch sử chat từ API
  useEffect(() => {
    const fetchChatSessions = async () => {
      try {
        setLoading(true);
        setError(null);

        const hotelId = params.id as string;
        const response = await axiosInstance.get(
          `/chatbot/by-hotel/${hotelId}`,
        );

        if (response.data) {
          setChatSessions(response.data);
        } else {
          setChatSessions([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải lịch sử chat:", error);
        setError("Không thể tải lịch sử chat. Vui lòng thử lại sau.");
        toast.error("Không thể tải lịch sử chat. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchChatSessions();
  }, [params.id]);

  const handleViewSession = (session: ChatSession) => {
    setSelectedSession(session);
    setIsDialogOpen(true);
  };

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredSessions = chatSessions.filter(
    (session) =>
      session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.messages.some((msg) =>
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  // Phân trang
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const currentItems = filteredSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Format thời gian
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Lấy tin nhắn đầu tiên của người dùng
  const getFirstUserMessage = (messages: Message[]) => {
    const userMessage = messages.find((msg) => msg.role === "user");
    if (userMessage) {
      return userMessage.content.length > 50
        ? userMessage.content.substring(0, 50) + "..."
        : userMessage.content;
    }
    return "Không có tin nhắn";
  };

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
                    <BreadcrumbPage>Lịch sử đoạn chat</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-6 p-6 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-bold tracking-tight">
                Lịch sử đoạn chat
              </h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm theo tên hoặc nội dung..."
                  className="pl-8 w-full sm:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquareText className="h-5 w-5 text-primary" />
                  Danh sách đoạn chat
                </CardTitle>
                <CardDescription>
                  Lịch sử các cuộc trò chuyện với Chatbot AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">
                        Đang tải dữ liệu...
                      </p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-lg font-medium text-destructive">
                      {error}
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => window.location.reload()}
                    >
                      Thử lại
                    </Button>
                  </div>
                ) : filteredSessions.length > 0 ? (
                  <>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">
                              Người dùng
                            </TableHead>
                            <TableHead className="hidden md:table-cell">
                              Nội dung đầu tiên
                            </TableHead>
                            <TableHead className="hidden sm:table-cell w-[180px]">
                              Thời gian
                            </TableHead>
                            <TableHead className="w-[100px]">
                              Tin nhắn
                            </TableHead>
                            <TableHead className="w-[80px] text-right">
                              Xem
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentItems.map((session) => (
                            <TableRow key={session._id}>
                              <TableCell className="font-medium">
                                {session.userName}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {getFirstUserMessage(session.messages)}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {formatDate(session.createdAt)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {session.messages.length}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewSession(session)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Phân trang */}
                    {totalPages > 1 && (
                      <div className="mt-4 flex justify-center">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  setCurrentPage((prev) =>
                                    Math.max(prev - 1, 1),
                                  )
                                }
                                disabled={currentPage === 1}
                                className="gap-1"
                              >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Trang trước</span>
                              </Button>
                            </PaginationItem>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter(
                                (page) =>
                                  page === 1 ||
                                  page === totalPages ||
                                  (page >= currentPage - 1 &&
                                    page <= currentPage + 1),
                              )
                              .map((page, i, array) => (
                                <React.Fragment key={page}>
                                  {i > 0 && array[i - 1] !== page - 1 && (
                                    <PaginationItem>
                                      <PaginationEllipsis />
                                    </PaginationItem>
                                  )}
                                  <PaginationItem>
                                    <PaginationLink
                                      isActive={page === currentPage}
                                      onClick={() => setCurrentPage(page)}
                                    >
                                      {page}
                                    </PaginationLink>
                                  </PaginationItem>
                                </React.Fragment>
                              ))}

                            <PaginationItem>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages),
                                  )
                                }
                                disabled={currentPage === totalPages}
                                className="gap-1"
                              >
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">Trang sau</span>
                              </Button>
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <MessageSquareText className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-lg font-medium">
                      Không tìm thấy đoạn chat nào
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchTerm
                        ? "Thử tìm kiếm với từ khóa khác"
                        : "Chưa có cuộc trò chuyện nào với Chatbot AI"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Dialog hiển thị chi tiết cuộc trò chuyện */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="w-[95%] max-w-[90vw] sm:max-w-[85vw] md:max-w-[75vw] lg:max-w-[65vw] xl:max-w-[55vw] max-h-[90vh] p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Chi tiết cuộc trò chuyện
                </DialogTitle>
                {selectedSession && (
                  <>
                    <div className="text-sm text-muted-foreground mt-1">
                      <p>Người dùng: {selectedSession.userName}</p>
                      <p>Thời gian: {formatDate(selectedSession.createdAt)}</p>
                    </div>
                  </>
                )}
              </DialogHeader>
              <ScrollArea className="h-[500px] pr-4 overflow-hidden">
                <div className="space-y-4 py-4 w-full">
                  {selectedSession?.messages.map((message) => (
                    <div
                      key={message._id}
                      className={cn(
                        "flex",
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start",
                      )}
                    >
                      {message.role === "assistant" && (
                        <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                          <AvatarImage src="/images/bot-avatar.png" alt="AI" />
                          <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg p-3 break-words overflow-hidden",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted",
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
                                code: ({ className, children, ...props }) => {
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
                        <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0">
                          <AvatarFallback>
                            {selectedSession.userName
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
