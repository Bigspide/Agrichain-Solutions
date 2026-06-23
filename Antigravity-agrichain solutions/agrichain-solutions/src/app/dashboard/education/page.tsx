"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { GraduationCap, Clock, Star, Play, BookOpen, Award, RefreshCw } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Course } from "@/types";

export default function EducationPage() {
  const { t, locale } = useI18n();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/courses?locale=${encodeURIComponent(locale)}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Course fetch failed");
        const payload = (await response.json()) as { courses?: Course[] };
        if (!cancelled) setCourses(payload.courses || []);
      } catch {
        if (!cancelled) setCourses([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadCourses();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const featured = courses[0];
  const stats = useMemo(() => {
    const inProgress = courses.filter((course) => course.completedLessons > 0 && course.completedLessons < course.lessons).length;
    const completed = courses.filter((course) => course.completedLessons >= course.lessons).length;
    return [
      { label: "Cours disponibles", value: courses.length.toString(), icon: BookOpen, color: "bg-blue-50 dark:bg-blue-900/20 text-blue-500" },
      { label: "En cours", value: inProgress.toString(), icon: Play, color: "bg-orange-50 dark:bg-orange-900/20 text-orange-500" },
      { label: "Termines", value: completed.toString(), icon: Award, color: "bg-green-50 dark:bg-green-900/20 text-green-500" },
      { label: "Certificats", value: completed.toString(), icon: GraduationCap, color: "bg-purple-50 dark:bg-purple-900/20 text-purple-500" },
    ];
  }, [courses]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{t("nav.education")}</h1>
        <p className="text-sm text-gray-500 mt-1">Formations agricoles synchronisees avec la base de donnees.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card-premium p-5">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </motion.div>

      {isLoading && (
        <div className="card-premium p-8 text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-primary-500 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Chargement des formations...</p>
        </div>
      )}

      {!isLoading && !featured && (
        <div className="card-premium p-8 text-center">
          <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-900 dark:text-white">Aucun cours disponible</p>
          <p className="text-sm text-gray-500 mt-1">Lancez le seed Prisma pour charger les parcours initiaux.</p>
        </div>
      )}

      {featured && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl p-8 text-white min-h-[280px] bg-navy-900"
        >
          {featured.thumbnail && (
            <Image
              src={featured.thumbnail}
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-45"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-900/75 to-primary-900/45" />
          <div className="relative max-w-xl">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-4 inline-block">Cours populaire</span>
            <h2 className="text-2xl font-display font-bold mb-2">{featured.title}</h2>
            <p className="text-purple-100 text-sm mb-4">{featured.description}</p>
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-purple-100">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {featured.duration}</span>
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {featured.lessons} lecons</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {featured.rating}</span>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-purple-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
              <Play className="w-4 h-4" /> Continuer le cours
            </button>
            <div className="mt-4 max-w-md">
              <div className="flex justify-between text-xs mb-1">
                <span>Progression</span>
                <span>{featured.completedLessons}/{featured.lessons} lecons</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full">
                <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, (featured.completedLessons / Math.max(featured.lessons, 1)) * 100)}%` }} />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {courses.length > 0 && (
        <div>
          <h2 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-4">Tous les cours</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.08 }}
                whileHover={{ y: -4 }}
                className="card-premium overflow-hidden cursor-pointer group"
              >
                <div className="h-40 bg-gradient-to-br from-primary-100 to-green-50 dark:from-primary-900/30 dark:to-green-900/30 relative overflow-hidden">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt=""
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <GraduationCap className="w-12 h-12 text-primary-400 opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-bold text-white ${
                    course.level === "beginner" ? "bg-green-500" : course.level === "intermediate" ? "bg-blue-500" : "bg-purple-500"
                  }`}>
                    {course.level === "beginner" ? "Debutant" : course.level === "intermediate" ? "Intermediaire" : "Avance"}
                  </span>
                </div>
                <div className="p-5">
                  <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">{course.category}</span>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mt-1 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.lessons}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                      <span className="text-xs font-semibold">{course.rating}</span>
                    </div>
                    <span className="text-xs text-gray-400">{course.instructor}</span>
                  </div>
                  {course.completedLessons > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(100, (course.completedLessons / Math.max(course.lessons, 1)) * 100)}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">{course.completedLessons}/{course.lessons} termine</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
