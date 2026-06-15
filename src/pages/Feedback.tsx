import React from "react";
import { MessageSquare, Star, Smile, Frown, Sparkles } from "lucide-react";
import { ExportButton } from "../components/ExportButton";

interface FeedbackProps {
  feedbacks: any[];
  users: any[];
}

export const Feedback: React.FC<FeedbackProps> = ({ feedbacks, users }) => {
  const totalReviews = feedbacks.length;

  // Average Rating
  const averageRating = totalReviews > 0
    ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  // Rating counts (1 to 5 stars)
  const ratingCounts = [0, 0, 0, 0, 0]; // index 0 = 1 star, ..., index 4 = 5 stars
  feedbacks.forEach(f => {
    if (f.rating >= 1 && f.rating <= 5) {
      ratingCounts[f.rating - 1]++;
    }
  });

  // Positives (4-5 stars) and Negatives (1-2 stars)
  const positiveCount = feedbacks.filter(f => f.rating >= 4).length;
  const negativeCount = feedbacks.filter(f => f.rating <= 2).length;

  const positivePercent = totalReviews > 0 ? ((positiveCount / totalReviews) * 100).toFixed(0) : 0;
  const negativePercent = totalReviews > 0 ? ((negativeCount / totalReviews) * 100).toFixed(0) : 0;

  // Helper to lookup user details
  const getUserInfo = (userId: string) => {
    const user = users.find(u => u.user_id === userId);
    return user ? { name: user.name, location: `${user.village || "-"}, ${user.district || "-"}` } : { name: "Anonymous Farmer", location: "Unknown Location" };
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">App Feedback & Reviews</h2>
          <p className="text-slate-500 text-sm mt-1">Listen to farmer voices, monitor app rating averages, and translate suggestions.</p>
        </div>
        <ExportButton
          data={feedbacks}
          filename="farmalert_reviews_export"
          headers={["ID", "User ID", "Rating", "Message", "Language", "Date"]}
          keys={["id", "user_id", "rating", "feedback_message", "language", "created_at"]}
          label="Export Reviews"
        />
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Rating</span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-extrabold text-slate-800">{averageRating}</h3>
              <span className="text-yellow-500 text-lg">★</span>
            </div>
            <p className="text-slate-400 text-xs mt-1">Based on {totalReviews} reviews</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
            <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Positive Reviews</span>
            <h3 className="text-3xl font-extrabold text-green-600 mt-1">{positivePercent}%</h3>
            <p className="text-slate-400 text-xs mt-1">{positiveCount} ratings (4-5 stars)</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <Smile className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Negative Reviews</span>
            <h3 className="text-3xl font-extrabold text-red-500 mt-1">{negativePercent}%</h3>
            <p className="text-slate-400 text-xs mt-1">{negativeCount} ratings (1-2 stars)</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <Frown className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Reviews List */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm xl:col-span-2 space-y-4">
          <h4 className="font-bold text-slate-800 text-sm">Recent Feedback Stream</h4>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-2 space-y-4">
            {feedbacks.map((f) => {
              const uInfo = getUserInfo(f.user_id);
              return (
                <div key={f.id} className="pt-4 first:pt-0 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-800 text-sm">{uInfo.name}</span>
                      <span className="text-slate-400 text-[10px] block mt-0.5">{uInfo.location}</span>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex gap-0.5 text-yellow-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < f.rating ? "fill-yellow-500" : ""}`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400">{new Date(f.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <p className="text-slate-600 leading-relaxed text-sm bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                    "{f.feedback_message}"
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 font-semibold rounded text-[9px] uppercase">
                      Lang: {f.language || "gu"}
                    </span>
                  </div>
                </div>
              );
            })}
            {feedbacks.length === 0 && (
              <p className="py-12 text-center text-slate-400 italic">No feedback messages received.</p>
            )}
          </div>
        </div>

        {/* Rating Breakdown card */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Rating Distributions</h4>
            <p className="text-slate-400 text-xs mt-0.5">Summary of user satisfaction scores</p>
          </div>

          <div className="space-y-3.5">
            {ratingCounts.map((count, index) => {
              const stars = index + 1;
              const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-12 text-slate-500 font-medium">{stars} Stars</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        stars >= 4 ? "bg-green-500" : stars === 3 ? "bg-amber-500" : "bg-red-500"
                      }`} 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-400 font-semibold">{count}</span>
                </div>
              );
            }).reverse()}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-500 leading-relaxed">
            <Sparkles className="h-5 w-5 text-yellow-500 shrink-0" />
            <div>
              <span className="font-semibold text-slate-800 block">SaaS Tip:</span> Monitor translation issues. Feedback tagged with English/Hindi/Gujarati filters can isolate localization problems.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
