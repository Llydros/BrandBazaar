"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, MessageSquare, Plus } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { LoginDialog } from "@/components/auth/login-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface QnAItem {
  id: string;
  question: string;
  answer?: string;
  askedBy: string;
  askedAt: string;
  answeredAt?: string;
}

interface ProductQAProps {
  productId: string;
  productName: string;
}

export function ProductQA({ productId, productName }: ProductQAProps) {
  const { user } = useAuth();
  const [qaItems, setQaItems] = useState<QnAItem[]>([
    // Mock questions for demo
    {
      id: "1",
      question: "What material are these shoes made from?",
      answer: "These shoes feature a premium leather upper with a durable rubber sole for long-lasting comfort and style.",
      askedBy: "customer123@example.com",
      askedAt: new Date(Date.now() - 86400000).toISOString(),
      answeredAt: new Date(Date.now() - 85000000).toISOString(),
    },
    {
      id: "2",
      question: "Are these true to size?",
      answer: "Yes, these shoes run true to size. We recommend ordering your usual shoe size. If you're between sizes, we suggest going up half a size.",
      askedBy: "shopper@example.com",
      askedAt: new Date(Date.now() - 172800000).toISOString(),
      answeredAt: new Date(Date.now() - 170000000).toISOString(),
    },
    {
      id: "3",
      question: "Do you offer international shipping?",
      askedBy: "buyer@example.com",
      askedAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitQuestion = async () => {
    if (!question.trim()) {
      alert("Please enter your question");
      return;
    }

    if (!user) {
      alert("Please log in to ask a question");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const newQnA: QnAItem = {
        id: Date.now().toString(),
        question: question.trim(),
        askedBy: user.email,
        askedAt: new Date().toISOString(),
      };

      setQaItems(prev => [newQnA, ...prev]);
      setQuestion("");
      setIsDialogOpen(false);
      setIsSubmitting(false);
      
      alert("Your question has been submitted! We'll get back to you soon.");
    }, 800);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const blurEmail = (email: string): string => {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) return `${localPart[0]}***@${domain}`;
    return `${localPart.substring(0, 2)}***@${domain}`;
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-gray-900 dark:text-gray-100" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Customer Questions & Answers
          </h2>
        </div>
        
        {user ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ask a Question
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ask a Question</DialogTitle>
                <DialogDescription>
                  Have a question about {productName}? We're here to help!
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Your Question</Label>
                  <Textarea
                    id="question"
                    placeholder="e.g., What material is this made from?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={isSubmitting}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    Be as specific as possible to get the best answer
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmitQuestion} disabled={isSubmitting || !question.trim()}>
                  {isSubmitting ? "Submitting..." : "Submit Question"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <LoginDialog>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ask a Question
            </Button>
          </LoginDialog>
        )}
      </div>

      {qaItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <HelpCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-lg font-medium mb-2">No questions yet</p>
          <p>Be the first to ask a question about this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {qaItems.map((item) => (
            <div
              key={item.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="space-y-3">
                {/* Question */}
                <div>
                  <div className="flex items-start gap-2 mb-1">
                    <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {item.question}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Asked by {blurEmail(item.askedBy)} • {formatDate(item.askedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Answer */}
                {item.answer ? (
                  <div className="ml-7 pl-3 border-l-2 border-green-500 dark:border-green-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {item.answer}
                    </p>
                    {item.answeredAt && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Answered by BrandBazaar • {formatDate(item.answeredAt)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="ml-7 pl-3 border-l-2 border-gray-300 dark:border-gray-600">
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      This question hasn't been answered yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

