"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getDefaultMosque,
  getPublicTransactions,
  getTransactionSummary,
  getMonthlyTrends,
  getPublicActivityFeed,
  getPublicTestimonials,
  getDashboardStats,
  getFundTypeBreakdown,
  getFeaturedPrograms,
  getBummProductsPublic,
  getBummStats,
} from "@/lib/actions/public";
export function useDefaultMosque() {
  return useQuery({
    queryKey: queryKeys.mosque.default,
    queryFn: getDefaultMosque,
    staleTime: 1000 * 60 * 30,
  });
}

export function usePublicTransactions(mosqueId: string) {
  return useQuery({
    queryKey: queryKeys.public.transactions(mosqueId),
    queryFn: () => getPublicTransactions(mosqueId),
    enabled: !!mosqueId,
  });
}

export function useTransactionSummary(mosqueId: string) {
  return useQuery({
    queryKey: queryKeys.public.transactionSummary(mosqueId),
    queryFn: () => getTransactionSummary(mosqueId),
    enabled: !!mosqueId,
  });
}

export function useMonthlyTrends(mosqueId: string) {
  return useQuery({
    queryKey: queryKeys.public.monthlyTrends(mosqueId),
    queryFn: () => getMonthlyTrends(mosqueId),
    enabled: !!mosqueId,
  });
}

export function usePublicActivityFeed(mosqueId: string) {
  return useQuery({
    queryKey: queryKeys.public.activityFeed(mosqueId),
    queryFn: () => getPublicActivityFeed(mosqueId),
    enabled: !!mosqueId,
    refetchInterval: 30_000,
  });
}

export function usePublicTestimonials(mosqueId: string) {
  return useQuery({
    queryKey: queryKeys.public.testimonials(mosqueId),
    queryFn: () => getPublicTestimonials(mosqueId),
    enabled: !!mosqueId,
  });
}

export function useDashboardStats(mosqueId: string) {
  return useQuery({
    queryKey: queryKeys.public.dashboardStats(mosqueId),
    queryFn: () => getDashboardStats(mosqueId),
    enabled: !!mosqueId,
  });
}

export function useFeaturedPrograms(mosqueId: string) {
  return useQuery({
    queryKey: queryKeys.programs.featured(mosqueId),
    queryFn: () => getFeaturedPrograms(mosqueId),
    enabled: !!mosqueId,
  });
}

export function useBummProducts(mosqueId: string) {
  return useQuery({
    queryKey: queryKeys.bumm.products(mosqueId),
    queryFn: () => getBummProductsPublic(mosqueId),
    enabled: !!mosqueId,
  });
}

export function useBummStats(mosqueId: string) {
  return useQuery({
    queryKey: [...queryKeys.bumm.products(mosqueId), "stats"],
    queryFn: () => getBummStats(mosqueId),
    enabled: !!mosqueId,
  });
}

export function useFundTypeBreakdown(mosqueId: string) {
  return useQuery({
    queryKey: queryKeys.public.fundTypeBreakdown(mosqueId),
    queryFn: () => getFundTypeBreakdown(mosqueId),
    enabled: !!mosqueId,
  });
}

async function fetchPublicApi() {
  const res = await fetch("/api/public");
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function usePublicData() {
  return useQuery({
    queryKey: ["public-api"],
    queryFn: fetchPublicApi,
    staleTime: 1000 * 60 * 5,
  });
}
