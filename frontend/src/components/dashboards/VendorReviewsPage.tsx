import { useMemo, useState } from "react";
import { MessageSquareReply, Star } from "lucide-react";
import { useMarketplace } from "../../context/MarketplaceContext";
import { formatDisplayDate } from "../../lib/date";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";

export function VendorReviewsPage() {
  const { reviews, respondToReview, isMutating } = useMarketplace();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const vendorReviews = useMemo(() => reviews, [reviews]);
  const averageRating = vendorReviews.length === 0
    ? 0
    : vendorReviews.reduce((sum, review) => sum + review.rating, 0) / vendorReviews.length;

  const handleRespond = async (reviewId: string) => {
    const response = drafts[reviewId]?.trim() ?? "";
    if (response.length < 2) {
      return;
    }

    const didSave = await respondToReview(reviewId, response);
    if (didSave) {
      setDrafts((current) => ({ ...current, [reviewId]: "" }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews & Remarks</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review client feedback, monitor your reputation, and reply to reviews directly from one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="py-5">
            <p className="text-sm text-gray-500">Average Rating</p>
            <p className="mt-2 text-3xl font-bold text-amber-500">{averageRating.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="py-5">
            <p className="text-sm text-gray-500">Total Reviews</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">{vendorReviews.length}</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="py-5">
            <p className="text-sm text-gray-500">Awaiting Response</p>
            <p className="mt-2 text-3xl font-bold text-rose-600">
              {vendorReviews.filter((review) => !review.vendorResponse).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {vendorReviews.length === 0 ? (
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="py-16 text-center text-sm text-gray-500">
              Reviews from completed bookings will appear here.
            </CardContent>
          </Card>
        ) : (
          vendorReviews.map((review) => (
            <Card key={review.id} className="border border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold text-gray-900">{review.userName}</CardTitle>
                    <p className="mt-1 text-sm text-gray-500">
                      {review.listingName} • {formatDisplayDate(review.createdAt)}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600">
                    <Star className="h-4 w-4 fill-current" />
                    {review.rating.toFixed(1)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-700">
                  {review.comment}
                </div>

                {review.vendorResponse ? (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
                    <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                      <MessageSquareReply className="h-4 w-4" />
                      Your response
                    </div>
                    <p className="text-sm text-blue-900">{review.vendorResponse}</p>
                    {review.respondedAt && (
                      <p className="mt-2 text-xs text-blue-600">Responded on {formatDisplayDate(review.respondedAt)}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      value={drafts[review.id] ?? ""}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [review.id]: event.target.value,
                        }))
                      }
                      placeholder="Write a professional response to this review..."
                      rows={4}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        className="rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                        disabled={isMutating || (drafts[review.id]?.trim().length ?? 0) < 2}
                        onClick={() => void handleRespond(review.id)}
                      >
                        Save Response
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
