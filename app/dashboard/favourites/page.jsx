"use client";

import { GetInterviewList } from "@/app/_Serveractions";
import { useUser } from "@/lib/simpleAuth";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import InterviewItemCard from "../_components/InterviewItemCard";
import Loading from "../_components/Loading";
import NoDataFound from "../_components/NoDataFound";

const FavouriteInterviews = () => {
  const { user } = useUser();

  const [interviewList, setInterviewList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [Lottie, setLottie] = useState(null);
  const [Favourite_Astronaut, setFavouriteAstronaut] = useState(null);

  // Load Lottie dynamically (client-only)
  useEffect(() => {
    import("lottie-react").then((module) => {
      setLottie(() => module.default);
    });
    import("@/public/Favourite_Astronaut.json").then((module) => {
      setFavouriteAstronaut(module.default);
    });
  }, []);

  useEffect(() => {
    if (user?.email) {
      fetchInterviews();
    }
  }, [user]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);

      const result = await GetInterviewList(user.email);

      if (result) {
        console.log("Favourite interviews 🚀", result);
        setInterviewList(result);

        const favorites = result.filter((interview) => interview?.favourite);
        setFilteredList(favorites);
      }
    } catch (error) {
      console.error("Error fetching favourite interviews:", error);
      toast.error("Error fetching favourite interviews");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="font-semibold text-lg">Favourite Hiremate Mock Interviews</h2>

      {loading ? (
        <div className="flex justify-center items-center m-auto h-[50%]">
          <Loading />
        </div>
      ) : (
        <>
          {/* Lottie Animation */}
          <div>
            {Lottie && Favourite_Astronaut ? (
              <Lottie
                animationData={Favourite_Astronaut}
                loop={true}
                className="h-72 m-auto"
              />
            ) : (
              <div className="h-72 w-72 bg-gray-200 rounded animate-pulse m-auto"></div>
            )}
          </div>

          {/* Favourite Interview List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-3">
            {filteredList.length > 0 ? (
              filteredList.map((favInterview) => (
                <InterviewItemCard
                  key={favInterview.mockId}
                  interview={favInterview}
                  refreshCallBack={fetchInterviews}
                />
              ))
            ) : (
              <div className="col-span-3">
                <NoDataFound message="No favourite interviews found !!" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FavouriteInterviews;

export const dynamic = "force-dynamic";
