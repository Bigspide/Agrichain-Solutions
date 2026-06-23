import { prisma } from '@/lib/prisma';

export async function createCourse(data: {
  title: string;
  description: string;
  category: string;
  duration: string;
  level: string;
  lessons: number;
  instructor: string;
  thumbnail: string;
  locale: string;
}) {
  return await prisma.course.create({
    data,
  });
}

export async function getCourses(locale: string, category?: string) {
  return await prisma.course.findMany({
    where: {
      locale,
      ...(category && { category }),
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getCourseById(id: string) {
  return await prisma.course.findUnique({
    where: { id },
  });
}
