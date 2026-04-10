"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllCourses } from "@/app/action/course";
import Header from "@/components/header";
import { Footer } from "@/components/footer";
import { CardItem } from "./card-item";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesPage() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await getAllCourses();
      return res
    }
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:px-0 md:py-12">
        <h1 className="text-xl sm:text-3xl font-bold text-center mb-8 mt-4">
          I want to learn...
        </h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:grid-cols-3">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))
            : courses?.map((course: any) => (
              <CardItem
                key={course.id}
                id={course.id}
                title={course.title}
                imageSrc={course.image_src}
                isActive={course.isActive}
                disabled={false}
              />
            ))
          }
        </div>
      </main>

      <div className="border-t">
        <Footer hideList={true} />
      </div>
    </div>
  );
}
