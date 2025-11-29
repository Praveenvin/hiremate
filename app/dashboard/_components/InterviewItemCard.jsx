"use client";

import { DeleteInterview, UpdateFavorite } from "@/app/_Serveractions";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaStar } from "react-icons/fa6";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const InterviewItemCard = ({ interview, refreshCallBack }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Toggle favourite
  const handleFavourite = async () => {
    try {
      const result = await UpdateFavorite(
        !interview?.favourite,
        interview?.mockId
      );

      if (result) {
        toast.success("Updated your favourite interviews");
        refreshCallBack();
      }
    } catch (error) {
      console.error("Error updating favourite", error);
      toast.error("Error updating favourite. Try again!");
    }
  };

  // Delete interview
  const handleDelete = async () => {
    try {
      setLoading(true);

      const result = await DeleteInterview(interview?.mockId);
      if (result) {
        toast.success("Interview deleted successfully!");
        refreshCallBack();
      }
    } catch (error) {
      console.error("Delete interview error:", error);
      toast.error("Error deleting interview. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border shadow-sm rounded-lg p-4 bg-white">
      {/* Header: Job title + Favourite icon */}
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-primary">{interview?.jobPosition}</h2>

        {interview?.favourite ? (
          <FaStar
            size={22}
            onClick={handleFavourite}
            className="cursor-pointer text-yellow-400"
          />
        ) : (
          <Star
            size={22}
            onClick={handleFavourite}
            className="cursor-pointer hover:text-primary"
          />
        )}
      </div>

      {/* Experience & Create Date */}
      <h2 className="text-sm font-medium text-gray-600 mt-1">
        {interview?.jobExperience} Years of Experience
      </h2>
      <h2 className="text-xs text-gray-400 mt-0.5">
        Created At: {interview?.createdAt}
      </h2>

      {/* Buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-3 items-center mt-3 gap-3">
        {/* Feedback */}
        <Button
          onClick={() =>
            router.push(
              `/dashboard/interview/${interview?.mockId}/feedback`
            )
          }
          size="sm"
          variant="outline"
          className="w-full"
        >
          Feedback
        </Button>

        {/* Start */}
        <Button
          onClick={() =>
            router.push(`/dashboard/interview/${interview?.mockId}`)
          }
          size="sm"
          className="w-full"
        >
          Start
        </Button>

        {/* Delete (Alert Dialog) */}
        <div className="flex justify-center lg:justify-end w-full">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={loading}
                size="sm"
                variant="outline"
                className="text-red-500"
              >
                {loading ? (
                  <LoaderCircle className="animate-spin text-red-500" />
                ) : (
                  <Trash2 />
                )}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Interview?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Your interview will be
                  permanently deleted from your account.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default InterviewItemCard;
