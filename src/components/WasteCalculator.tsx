import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building,
  Home,
  Earth,
  Trash2,
  Zap,
  Car,
  ShoppingCart,
  Wheat,
  Wind,
  CheckSquare,
  Timer,
  ShoppingBag,
  BookOpen,
  Eye,
  Trophy,
  Users,
  PoundSterling,
} from "lucide-react";
import WorldsDisplay from "./WorldsDisplay";
import PostcardsFromFuture from "./PostcardsFromFuture";
import CategoryQuestionnaire from "./CategoryQuestionnaire";
import CaerphillyMap from "./CaerphillyMap";
import AvatarSystem from "./AvatarSystem";
import RenewableShop from "./RenewableShop";
import UserProgress from "./UserProgress";
import KnowledgeBase from "./KnowledgeBase";
import Leaderboard from "./Leaderboard";
import CommunityStories from "./CommunityStories";
import BottomNavigation from "./BottomNavigation";
import LandingScreen from "./LandingScreen";
import caerphillyBusinessLogo from "@/assets/caerphilly-business-club-logo.png";
import caerphillyCouncilLogo from "@/assets/caerphilly-council-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { api, createRenewable, fetchMyProfile, fetchRenewables, updateRenewable } from "@/lib/api";

import { useToast } from "@/hooks/use-toast";

type UserMode = "resident" | "business";

interface WasteCalculatorProps {
  mode?: UserMode;
  onModeChange?: (mode: UserMode) => void;
}

const WasteCalculator: React.FC<WasteCalculatorProps> = ({ mode: externalMode, onModeChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<UserMode>(externalMode || "resident");
  const [footprint, setFootprint] = useState(0);
  const [activeTab, setActiveTab] = useState("landing");

  // Category completion states
  const [completedCategories, setCompletedCategories] = useState<string[]>([]);
  const [showQuestionnaire, setShowQuestionnaire] = useState<string | null>(null);

  // User profile states
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userRenewables, setUserRenewables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAvatarPanels, setShowAvatarPanels] = useState(false);

  // Sync external mode prop with internal state
  useEffect(() => {
    if (externalMode) {
      setMode(externalMode);
    }
  }, [externalMode]);

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      loadUserData();
      loadSprintData();
      loadCompletedCategories();
    }
  }, [user]);

  // Save category completion states locally (per-user). Server source of truth is /responses.
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(`cloudrow:user_calc_categories:${user.id}`, JSON.stringify(completedCategories));
      } catch {}
    }
  }, [completedCategories, user]);

  const loadCompletedCategories = async () => {
    if (!user) return;
    try {
      const cached = localStorage.getItem(`cloudrow:user_calc_categories:${user.id}`);
      if (cached) setCompletedCategories(JSON.parse(cached));
    } catch {}
  };


  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load user profile
      const profile = await fetchMyProfile(user.id).catch(() => null);

      if (profile) {
        setUserProfile(profile);
        const newFootprint = profile.current_footprint || 0;
        console.log("Loading footprint from profile:", newFootprint);
        setFootprint(newFootprint);
      }

      // Load user renewables
      const renewables = await fetchRenewables(user.id).catch(() => [] as any[]);

      if (Array.isArray(renewables)) {
        setUserRenewables(renewables);
      }

      // Load user pledges to get count
      const pledges = await api
        .get(`/pledges?user_id=${encodeURIComponent(user.id)}`)
        .catch(() => [] as any[]);

      if (Array.isArray(pledges)) {

        setPledges(
          pledges.map((p) => {
            // Find the matching pledge from categories to get costSaving
            const allPledges = Object.values(pledgeCategories).flat() as Array<{ action: string; costSaving?: number }>;
            const matchingPledge = allPledges.find((pledge) => pledge.action === p.action);

            return {
              id: p.id,
              category: p.category,
              action: p.action,
              impact: p.points_earned,
              frequency: "once",
              costSaving: matchingPledge?.costSaving || 0,
            };
          }),
        );
      }

      // ✅ Use API instead of Supabase
      const responses = (await api.get(`/responses?user_id=${user.id}`)) as Array<{ category: string }>;

      if (responses) {
        const completed = [...new Set(responses.map((r) => r.category))] as string[];
        setCompletedCategories(completed);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSprintData = async () => {
    if (!user) return;
    try {
      // warm from cache
      try {
        const cached = localStorage.getItem(`cloudrow:user_sprints:waste_calculator:${user.id}`);
        if (cached) setSprints(JSON.parse(cached));
      } catch {}
      const { fetchUserSprintData, saveUserSprintData } = await import("@/lib/api");
      const data = await fetchUserSprintData(user.id, "waste_calculator");
      if (data) {
        const list = (data as any).list;
        if (Array.isArray(list)) {
          setSprints(list);
          try {
            localStorage.setItem(`cloudrow:user_sprints:waste_calculator:${user.id}`, JSON.stringify(list));
          } catch {}
          return;
        }
      }
      // legacy migration from device-wide 'userSprints'
      try {
        const legacy = localStorage.getItem("userSprints");
        if (legacy) {
          const sd = JSON.parse(legacy);
          if (sd.userId === user.id && Array.isArray(sd.sprints)) {
            await saveUserSprintData(user.id, "waste_calculator", { list: sd.sprints });
            setSprints(sd.sprints);
            try {
              localStorage.setItem(`cloudrow:user_sprints:waste_calculator:${user.id}`, JSON.stringify(sd.sprints));
            } catch {}
            localStorage.removeItem("userSprints");
          }
        }
      } catch {}
    } catch (error) {
      console.error("Error loading sprint data:", error);
    }
  };

  // Reset footprint and progress when mode changes
  const handleModeChange = (newMode: UserMode) => {
    setMode(newMode);
    setFootprint(0);
    setCompletedCategories([]);
    setPledges([]);
    setSprints([]);

    // Call parent's onModeChange if provided
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const [pledges, setPledges] = useState<
    Array<{
      id: string;
      category: string;
      action: string;
      impact: number;
      frequency: string;
      costSaving?: number;
    }>
  >([]);

  const [sprints, setSprints] = useState<
    Array<{
      id: string;
      title: string;
      impact: number;
      frequency: string;
      completed: boolean;
      duration?: number; // days
      startDate?: Date;
      endDate?: Date;
      points?: number;
      costSaving?: number;
    }>
  >([]);

  const [sprintDuration, setSprintDuration] = useState(7); // Default 7 days
  const [activeView, setActiveView] = useState("pledges");

  const handleCategoryClick = (categoryId: string) => {
    setShowQuestionnaire(categoryId);
  };

  const handleQuestionnaireComplete = async (categoryId: string, impact: number) => {
    let newFootprint = footprint;

    if (!completedCategories.includes(categoryId)) {
      setCompletedCategories((prev) => [...prev, categoryId]);
      newFootprint = footprint + impact;
      setFootprint(newFootprint);
    } else {
      // Retaking questionnaire - update footprint
      const categoryQuestions = {
        waste: { baseImpact: 600 },
        energy: { baseImpact: 800 },
        buildings: { baseImpact: 700 },
        travel: { baseImpact: 1000 },
        consumption: { baseImpact: 500 },
        "land-food": { baseImpact: 900 },
      };
      const oldImpact = categoryQuestions[categoryId]?.baseImpact || 600;
      newFootprint = footprint - oldImpact + impact;
      setFootprint(newFootprint);
    }

    // Save to database
    if (user) {
      try {
        await api.post("/profile/update", { user_id: user.id, current_footprint: newFootprint });

        console.log("Footprint successfully updated to:", newFootprint);
        setUserProfile((prev) => ({ ...prev, current_footprint: newFootprint }));

        toast({
          title: "Footprint Updated",
          description: `Your carbon footprint has been updated to ${(newFootprint / 1000).toFixed(1)} tons CO₂/year.`,
        });
      } catch (error) {
        console.error("Error saving footprint:", error);
        toast({
          title: "Error",
          description: "Failed to save your footprint. Please try again.",
          variant: "destructive",
        });
      }
    }

    setShowQuestionnaire(null);
  };

  const handleQuestionnaireClose = () => {
    setShowQuestionnaire(null);
  };

  const handlePledgeClick = (categoryId: string) => {
    const categoryPledgeMap = {
      waste: "Waste Reduction",
      energy: "Household Energy",
      buildings: "Home Practices",
      travel: "Transport",
      consumption: "Quick Wins",
      "land-food": "Big Lifestyle Changes",
    };

    const pledgeCategory =
      mode === "business"
        ? categoryId === "energy"
          ? "Energy Efficiency"
          : "Waste Reduction"
        : categoryPledgeMap[categoryId];

    // Switch to pledges tab
    setActiveView("pledges");

    setTimeout(() => {
      // Find and scroll to the relevant pledge category
      const categoryHeaders = document.querySelectorAll("h3");
      for (const header of categoryHeaders) {
        if (header.textContent?.includes(pledgeCategory)) {
          header.scrollIntoView({ behavior: "smooth", block: "start" });
          break;
        }
      }
    }, 300);
  };

  const addPledge = async (
    category: string,
    action: string,
    impact: number,
    frequency: string,
    costSaving: number = 0,
  ) => {
    if (!user) return;

    // Check if pledge already exists and if it's repeatable
    const existingPledge = pledges.find((p) => p.action === action && p.category === category);
    const isRepeatable =
      frequency === "daily" ||
      frequency === "weekly" ||
      Object.values(pledgeCategories)
        .flat()
        .some((p) => p.action === action && p.repeatable);

    if (existingPledge && !isRepeatable) {
      toast({
        title: "Already Pledged",
        description: "You've already made this pledge!",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save pledge via API
      const data = await api.post("/pledges", {
        user_id: user.id,
        category,
        action,
        points_earned: impact,
      });


      // Calculate points based on difficulty/time/cost
      let points = impact;
      if (impact >= 5000)
        points = 150; // Very high impact (car free, no flying) = 150 points
      else if (impact >= 2000)
        points = 100; // High impact (solar, heat pump) = 100 points
      else if (impact >= 1000)
        points = 50; // Medium high impact = 50 points
      else if (impact >= 500)
        points = 25; // Medium impact = 25 points
      else if (impact >= 100)
        points = 15; // Low impact = 15 points
      else points = 5; // Quick wins = 5 points

      // Update user's total points via API
      const newTotalPoints = (userProfile?.total_points || 0) + points;
      try {
        await api.post('/profile/update', {
          user_id: user.id,
          total_points: newTotalPoints,
        });
      } catch (e) {
        console.error('Failed to update points:', e);
      }

      const newPledge = {
        id: data.id,
        category,
        action,
        impact: points,
        frequency,
        costSaving,
      };

      const updatedPledges = [...pledges, newPledge];
      setPledges(updatedPledges);

      // Update user profile state
      setUserProfile((prev) => ({
        ...prev,
        total_points: newTotalPoints,
      }));

      toast({
        title: "Pledge Added!",
        description: `You earned ${points} points for: ${action}`,
      });
    } catch (error) {
      console.error("Error adding pledge:", error);
      toast({
        title: "Error",
        description: "Failed to add pledge. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRenewablePurchase = async (tech: any) => {
    if (!user) return;

    try {
      // Save renewable via API (position left null — user places it next on the map)
      const data = await createRenewable({
        user_id: user.id,
        technology_type: tech.type,
        points_cost: tech.pointsCost,
      });

      // Deduct points from user's total
      const newTotalPoints = (userProfile?.total_points || 0) - tech.pointsCost;
      await api.post("/profile/update", { user_id: user.id, total_points: newTotalPoints });

      // Update local state
      const savedRenewable = data?.data ?? data?.row ?? data;
      if (savedRenewable?.id) {
        setUserRenewables((prev) => [...prev, savedRenewable]);
      } else {
        setUserRenewables(await fetchRenewables(user.id));
      }
      setUserProfile((prev) => ({
        ...prev,
        total_points: newTotalPoints,
      }));

      // Reveal the map so the user can place it
      setShowAvatarPanels(true);
      toast({
        title: `${tech.name} ready to place`,
        description: "Tap anywhere on the Borough map to install it.",
      });
    } catch (error) {
      console.error("Error purchasing renewable:", error);
      toast({
        title: "Error",
        description: "Failed to purchase technology. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePlaceRenewable = async (renewableId: string, x: number, y: number) => {
    if (!user) return;
    try {
      await updateRenewable(renewableId, {
        user_id: user.id,
        position_x: x,
        position_y: y,
      });
    } catch (e: any) {
      toast({ title: "Could not save placement", description: e?.message ?? "Try again", variant: "destructive" });
      return;
    }
    setUserRenewables((prev) => prev.map((r) => (r.id === renewableId ? { ...r, position_x: x, position_y: y } : r)));
  };


  const addSprint = async (title: string, impact: number, frequency: string, costSaving: number = 0) => {
    if (!user) return;

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + sprintDuration);

    // Calculate points based on duration: more days = more points
    const pointMultiplier = sprintDuration <= 3 ? 1 : sprintDuration <= 7 ? 1.5 : sprintDuration <= 14 ? 2 : 2.5;
    const points = Math.round(impact * 0.1 * pointMultiplier); // Convert impact to points with duration bonus

    const newSprint = {
      id: Date.now().toString(),
      title,
      impact,
      frequency,
      completed: false,
      duration: sprintDuration,
      startDate: now,
      endDate: endDate,
      points: points,
      costSaving,
    };

    const nextSprints = [...sprints, newSprint];
    setSprints(nextSprints);

    // Persist sprint data per-user to cloud (with offline cache).
    try {
      localStorage.setItem(`cloudrow:user_sprints:waste_calculator:${user.id}`, JSON.stringify(nextSprints));
    } catch {}
    void api.post("/sprints/save", {
      user_id: user.id,
      sprint_key: "waste_calculator",
      data: { list: nextSprints },
    });
  };

  const completeSprint = async (id: string) => {
    if (!user) return;

    const sprint = sprints.find((s) => s.id === id);
    if (!sprint || sprint.completed) return;

    try {
      // Award points to user
      const newTotalPoints = (userProfile?.total_points || 0) + (sprint.points || 0);
      await api.post("/profile/update", { user_id: user.id, total_points: newTotalPoints });

      // Update local state
      const updatedSprints = sprints.map((sprint) => (sprint.id === id ? { ...sprint, completed: true } : sprint));
      setSprints(updatedSprints);

      // Persist updated sprint list to cloud (with offline cache).
      try {
        localStorage.setItem(`cloudrow:user_sprints:waste_calculator:${user.id}`, JSON.stringify(updatedSprints));
      } catch {}
      void api.post("/sprints/save", {
        user_id: user.id,
        sprint_key: "waste_calculator",
        data: { list: updatedSprints },
      });

      setUserProfile((prev) => ({
        ...prev,
        total_points: newTotalPoints,
      }));

      toast({
        title: "Sprint Completed!",
        description: `You earned ${sprint.points} points for completing: ${sprint.title}`,
      });
    } catch (error) {
      console.error("Error completing sprint:", error);
      toast({
        title: "Error",
        description: "Failed to complete sprint. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function to calculate countdown and progress
  const getSprintProgress = useCallback((sprint: any) => {
    if (!sprint.startDate || !sprint.endDate)
      return {
        daysLeft: 0,
        progress: 100,
        isExpired: true,
        countdown: "00:00:00:00",
      };

    const now = new Date();
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const remaining = Math.max(0, end.getTime() - now.getTime());

    const daysLeft = Math.max(0, Math.ceil(remaining / (1000 * 60 * 60 * 24)));
    const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
    const isExpired = now > end;

    // Calculate countdown in dd:hh:mm:ss format
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    const countdown = `${days.toString().padStart(2, "0")}:${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    return { daysLeft, progress, isExpired, countdown };
  }, []);

  // Timer for real-time countdown updates
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const categories = [
    {
      id: "waste",
      title: "Waste",
      description: "Your household waste and recycling habits",
      icon: "lucide",
      iconComponent: Trash2,
    },
    {
      id: "energy",
      title: "Energy",
      description: "Your home energy consumption and efficiency",
      icon: "lucide",
      iconComponent: Wind,
    },
    {
      id: "buildings",
      title: "Buildings",
      description: "Your home's efficiency and building-related emissions",
      icon: "lucide",
      iconComponent: Home,
    },
    {
      id: "travel",
      title: "Travel",
      description: "Your transport and travel carbon footprint",
      icon: "lucide",
      iconComponent: Car,
    },
    {
      id: "consumption",
      title: "Consumption",
      description: "Your consumption patterns and purchasing habits",
      icon: "lucide",
      iconComponent: ShoppingCart,
    },
    {
      id: "land-food",
      title: "Land Use & Food",
      description: "Your diet and land use related emissions",
      icon: "lucide",
      iconComponent: Wheat,
    },
  ];

  const getLabels = () => {
    if (mode === "business") {
      return {
        title: "Caerphilly Business Climate Impact",
        description:
          "Reduce your environmental impact whilst strengthening the local economy through sustainable trading practices.",
        pledgesTab: "Local Business Actions",
        sprintsTab: "Quick Wins",
        postcardsTab: "Future Vision",
        localBenefit: "Every local trade reduces transport emissions and supports our community's carbon goals",
      };
    } else {
      return {
        title: "My Climate Impact",
        description: "Track your carbon footprint and take action to reduce it.",
        pledgesTab: "My Pledges",
        sprintsTab: "Sprints",
        postcardsTab: "Future Vision",
        localBenefit: "",
      };
    }
  };

  const pledgeCategories =
    mode === "business"
      ? {
          "Waste Reduction": [
            {
              action: "Switch to compostable packaging with clear labelling",
              impact: 500,
              costSaving: 200,
              guidance: "https://wrap.org.uk/taking-action/food-drink/actions/packaging",
            },
            {
              action: "Offer discount for bring-your-own-container",
              impact: 200,
              costSaving: 50,
              guidance: "https://wrap.org.uk/taking-action/food-drink/actions/packaging",
              repeatable: true,
            },
            {
              action: "Use compostable parcel tape for easy box composting",
              impact: 150,
              costSaving: 30,
              guidance: "https://wrap.org.uk/taking-action/food-drink/actions/packaging",
            },
            {
              action: "Encourage suppliers to use less packaging",
              impact: 400,
              costSaving: 150,
              guidance: "https://wrap.org.uk/taking-action/food-drink/actions/packaging",
            },
            {
              action: "Join or start local business reuse network",
              impact: 300,
              costSaving: 400,
              guidance: "https://www.gov.uk/government/publications/waste-management-plan-for-england",
            },
            {
              action: "Implement office recycling programme",
              impact: 300,
              costSaving: 120,
              guidance: "https://www.gov.uk/government/publications/waste-management-plan-for-england",
            },
            {
              action: "Start corporate food waste reduction",
              impact: 600,
              costSaving: 800,
              guidance: "https://wrap.org.uk/taking-action/food-drink",
            },
            {
              action: "Daily office waste audit",
              impact: 10,
              costSaving: 5,
              frequency: "daily",
              guidance: "https://wrap.org.uk/taking-action/food-drink",
            },
          ],
          "Energy Efficiency": [
            {
              action: "LED lighting upgrade",
              impact: 800,
              costSaving: 300,
              guidance:
                "https://www.carbontrust.com/our-work-and-impact/guides-reports-and-tools/lighting-technology-guide",
            },
            {
              action: "Smart building management system",
              impact: 1200,
              costSaving: 800,
              guidance:
                "https://www.carbontrust.com/our-work-and-impact/guides-reports-and-tools/building-energy-management-systems",
            },
            {
              action: "Equipment efficiency audit",
              impact: 500,
              costSaving: 200,
              guidance: "https://www.carbontrust.com/what-we-do/advice/energy-assessments",
              repeatable: true,
            },
            {
              action: "Switch to renewable energy supplier",
              impact: 1000,
              costSaving: 400,
              guidance: "https://www.ofgem.gov.uk/about-us/how-we-engage/blogs/how-switch-green-energy-tariff",
            },
            {
              action: "Install on-site renewable energy systems",
              impact: 2000,
              costSaving: 1200,
              guidance:
                "https://www.carbontrust.com/our-work-and-impact/guides-reports-and-tools/renewable-energy-technology-guide",
            },
            {
              action: "Adopt low-carbon heating solutions",
              impact: 1500,
              costSaving: 600,
              guidance: "https://www.carbontrust.com/our-work-and-impact/guides-reports-and-tools/heat-pump-guide",
            },
            {
              action: "Turn off equipment overnight",
              impact: 15,
              costSaving: 8,
              frequency: "daily",
              guidance:
                "https://www.carbontrust.com/our-work-and-impact/guides-reports-and-tools/lighting-technology-guide",
            },
          ],
          Transportation: [
            {
              action: "Electric company vehicle fleet",
              impact: 2000,
              costSaving: 1500,
              guidance: "https://www.gov.uk/plug-in-car-van-grants",
            },
            {
              action: "Staff cycle-to-work scheme",
              impact: 300,
              costSaving: 200,
              guidance: "https://www.cyclescheme.co.uk/",
            },
            {
              action: "Remote working policy",
              impact: 600,
              costSaving: 2000,
              guidance: "https://www.gov.uk/flexible-working",
            },
            {
              action: "Incentivise collection over delivery",
              impact: 400,
              costSaving: 100,
              guidance: "https://www.gov.uk/guidance/travel-and-transport-saving-money-and-the-environment",
              repeatable: true,
            },
            {
              action: "No free delivery for short distances",
              impact: 300,
              costSaving: 50,
              guidance: "https://www.gov.uk/guidance/travel-and-transport-saving-money-and-the-environment",
            },
            {
              action: "Encourage staff to walk to local meetings",
              impact: 5,
              costSaving: 10,
              frequency: "daily",
              guidance: "https://www.gov.uk/guidance/travel-and-transport-saving-money-and-the-environment",
            },
          ],
          "Workplace Practices": [
            {
              action: "Digital clean-up and email management",
              impact: 100,
              costSaving: 20,
              guidance:
                "https://www.carbontrust.com/our-work-and-impact/guides-reports-and-tools/carbon-footprinting-guide",
              repeatable: true,
            },
            {
              action: "Paperless billing and correspondence",
              impact: 150,
              costSaving: 300,
              guidance: "https://www.gov.uk/government/publications/waste-management-plan-for-england",
            },
            {
              action: "Sustainability workshops for staff",
              impact: 200,
              costSaving: 0,
              guidance: "https://www.carbontrust.com/what-we-do/advice/carbon-training",
              repeatable: true,
            },
            {
              action: "Green procurement policy",
              impact: 400,
              costSaving: 500,
              guidance: "https://www.gov.uk/guidance/sustainable-procurement-the-gbs-guide",
            },
            {
              action: "Print double-sided only",
              impact: 3,
              costSaving: 2,
              frequency: "daily",
              guidance: "https://www.gov.uk/government/publications/waste-management-plan-for-england",
            },
          ],
        }
      : {
          "Big Lifestyle Changes": [
            {
              action: "I won't fly for a year",
              impact: 10000,
              costSaving: 3000,
              guidance:
                "https://www.carbontrust.com/our-work-and-impact/guides-reports-and-tools/flight-carbon-calculator",
            },
            {
              action: "Go car free for a year",
              impact: 5000,
              costSaving: 8000,
              guidance: "https://www.gov.uk/guidance/travel-and-transport-saving-money-and-the-environment",
            },
            {
              action: "Install solar panels",
              impact: 2000,
              costSaving: 800,
              guidance: "https://energysavingtrust.org.uk/advice/solar-panels/",
            },
            {
              action: "Adopt renewable heating (heat pump)",
              impact: 2500,
              costSaving: 600,
              guidance: "https://energysavingtrust.org.uk/advice/heat-pumps/",
            },
            {
              action: "Combine solar with home battery system",
              impact: 500,
              costSaving: 300,
              guidance: "https://energysavingtrust.org.uk/advice/solar-panels/",
            },
            {
              action: "Become vegetarian for a year",
              impact: 1500,
              costSaving: 400,
              guidance: "https://www.gov.uk/government/publications/food-and-farming-statistics",
            },
            {
              action: "Invest in renewable energy stocks/bonds",
              impact: 800,
              costSaving: 0,
              guidance: "https://www.gov.uk/government/publications/clean-growth-strategy",
            },
            {
              action: "Switch to renewable energy provider",
              impact: 1500,
              costSaving: 200,
              guidance: "https://www.ofgem.gov.uk/about-us/how-we-engage/blogs/how-switch-green-energy-tariff",
            },
            {
              action: "Buy second-hand (charity shops, eBay, Vinted)",
              impact: 800,
              costSaving: 500,
              guidance: "https://www.wrap.org.uk/taking-action/textiles/re-use",
              repeatable: true,
            },
            {
              action: "Order and use food caddy for leftover food waste",
              impact: 400,
              costSaving: 0,
              guidance: "https://www.lovefoodhatewaste.com/food-waste-recycling",
            },
            {
              action: "Buy local instead of using convenient apps",
              impact: 600,
              costSaving: 200,
              guidance: "https://www.seasonalfoodcalendar.co.uk/",
              repeatable: true,
            },
            {
              action: "Use e-cards or make recycled cards",
              impact: 50,
              costSaving: 25,
              guidance: "https://www.wrap.org.uk/taking-action/citizen-consumer/reduce-reuse-recycle",
              repeatable: true,
            },
            {
              action: "Cancel junk mail subscriptions",
              impact: 30,
              costSaving: 0,
              guidance: "https://www.royalmail.com/personal/receiving-mail/manage-your-mail",
            },
            {
              action: "Buy in bulk to reduce packaging",
              impact: 200,
              costSaving: 100,
              guidance: "https://wrap.org.uk/taking-action/food-drink/actions/packaging",
              repeatable: true,
            },
          ],
          "Quick Wins": [
            {
              action: "Sign up for paperless billing",
              impact: 25,
              costSaving: 0,
              guidance: "https://www.gov.uk/government/publications/waste-management-plan-for-england",
            },
            {
              action: "Invest in quality tupperware/lunchboxes",
              impact: 100,
              costSaving: 150,
              guidance: "https://www.wrap.org.uk/taking-action/citizen-consumer/reduce-reuse-recycle",
            },
            {
              action: "Reuse single-use plastic bags multiple times",
              impact: 50,
              costSaving: 20,
              guidance: "https://www.wrap.org.uk/taking-action/citizen-consumer/reduce-reuse-recycle",
              repeatable: true,
            },
            {
              action: "Take better care of food storage",
              impact: 200,
              costSaving: 300,
              guidance: "https://www.lovefoodhatewaste.com/article/food-storage-a-z",
            },
            {
              action: "Buy groceries loose rather than bagged",
              impact: 75,
              costSaving: 50,
              guidance: "https://wrap.org.uk/taking-action/food-drink/actions/packaging",
              repeatable: true,
            },
            {
              action: "Start composting in garden",
              impact: 300,
              costSaving: 100,
              guidance: "https://www.rhs.org.uk/soil-composts-mulches/composting",
            },
            {
              action: "Say no to receipts",
              impact: 20,
              costSaving: 0,
              guidance: "https://www.wrap.org.uk/taking-action/citizen-consumer/reduce-reuse-recycle",
              repeatable: true,
            },
            {
              action: "Set up use-me-first shelf in fridge",
              impact: 150,
              costSaving: 200,
              guidance: "https://www.lovefoodhatewaste.com/article/food-storage-a-z",
            },
            {
              action: "Walk for errands under 1 mile",
              impact: 8,
              costSaving: 3,
              frequency: "daily",
              guidance: "https://www.sustrans.org.uk/our-blog/get-active/2019/everyday-walking-and-cycling/",
            },
            {
              action: "Turn off lights when leaving",
              impact: 2,
              costSaving: 1,
              frequency: "daily",
              guidance: "https://www.energysavingtrust.org.uk/advice/lighting/",
            },
            {
              action: "Use washing-up bowl vs running tap",
              impact: 3,
              costSaving: 2,
              frequency: "daily",
              guidance: "https://www.rhs.org.uk/garden-features/water-gardens/water-saving",
            },
            {
              action: "Skip one car journey",
              impact: 12,
              costSaving: 8,
              frequency: "daily",
              guidance: "https://www.sustrans.org.uk/our-blog/get-active/2019/everyday-walking-and-cycling/",
            },
            {
              action: "Unplug one device overnight",
              impact: 1,
              costSaving: 1,
              frequency: "daily",
              guidance: "https://www.energysavingtrust.org.uk/advice/lighting/",
            },
            {
              action: "Eat one plant-based meal",
              impact: 6,
              costSaving: 4,
              frequency: "daily",
              guidance: "https://www.nutrition.org.uk/nutritionscience/sustainability/",
            },
          ],
          "Household Energy": [
            {
              action: "Switch to renewable energy provider",
              impact: 1500,
              costSaving: 300,
              guidance: "https://www.ofgem.gov.uk/about-us/how-we-engage/blogs/how-switch-green-energy-tariff",
            },
            {
              action: "Install smart thermostat",
              impact: 400,
              costSaving: 150,
              guidance: "https://www.energysavingtrust.org.uk/advice/thermostats-and-heating-controls/",
            },
            {
              action: "LED bulb replacement programme",
              impact: 200,
              costSaving: 80,
              guidance: "https://www.energysavingtrust.org.uk/advice/lighting/",
              repeatable: true,
            },
            {
              action: "Turn thermostat down by 1°C",
              impact: 300,
              costSaving: 120,
              guidance: "https://www.energysavingtrust.org.uk/advice/heating-and-hot-water/",
            },
            {
              action: "Use draught excluders",
              impact: 200,
              costSaving: 75,
              guidance: "https://www.energysavingtrust.org.uk/advice/draught-proofing/",
              repeatable: true,
            },
            {
              action: "Install solar panels",
              impact: 2000,
              costSaving: 800,
              guidance: "https://www.energysavingtrust.org.uk/advice/solar-panels/",
            },
            {
              action: "Combine solar with home battery system",
              impact: 500,
              costSaving: 400,
              guidance: "https://www.energysavingtrust.org.uk/advice/solar-panels/",
            },
            {
              action: "Adopt renewable heating (heat pump)",
              impact: 2500,
              costSaving: 1000,
              guidance: "https://www.energysavingtrust.org.uk/advice/heat-pumps/",
            },
            {
              action: "Use flexible energy tariffs",
              impact: 200,
              costSaving: 100,
              guidance: "https://www.ofgem.gov.uk/about-us/how-we-engage/blogs/how-switch-green-energy-tariff",
            },
            {
              action: "Unplug chargers when not in use",
              impact: 4,
              frequency: "daily",
              guidance: "https://www.energysavingtrust.org.uk/advice/lighting/",
            },
          ],
          Transport: [
            {
              action: "Walk/cycle for short journeys",
              impact: 500,
              costSaving: 400,
              guidance: "https://www.sustrans.org.uk/our-blog/get-active/2019/everyday-walking-and-cycling/",
              repeatable: true,
            },
            {
              action: "Use public transport regularly",
              impact: 800,
              costSaving: 600,
              guidance: "https://www.gov.uk/guidance/travel-and-transport-saving-money-and-the-environment",
              repeatable: true,
            },
            {
              action: "Car sharing/lift sharing",
              impact: 300,
              costSaving: 200,
              guidance: "https://liftshare.com/",
              repeatable: true,
            },
            {
              action: "Combine errands to reduce trips",
              impact: 200,
              costSaving: 150,
              guidance: "https://www.gov.uk/guidance/travel-and-transport-saving-money-and-the-environment",
              repeatable: true,
            },
            {
              action: "Walk or cycle to local shops",
              impact: 6,
              costSaving: 4,
              frequency: "daily",
              guidance: "https://www.sustrans.org.uk/our-blog/get-active/2019/everyday-walking-and-cycling/",
            },
            {
              action: "Take public transport once",
              impact: 8,
              costSaving: 6,
              frequency: "daily",
              guidance: "https://www.gov.uk/guidance/travel-and-transport-saving-money-and-the-environment",
            },
            {
              action: "Work from home one day",
              impact: 25,
              costSaving: 20,
              frequency: "daily",
              guidance: "https://www.gov.uk/guidance/travel-and-transport-saving-money-and-the-environment",
            },
          ],
          "Home Practices": [
            {
              action: "Batch cooking and meal prepping",
              impact: 250,
              costSaving: 200,
              guidance: "https://www.lovefoodhatewaste.com/article/batch-cooking",
              repeatable: true,
            },
            {
              action: "Take reusable water bottle everywhere",
              impact: 100,
              costSaving: 80,
              guidance: "https://www.wrap.org.uk/taking-action/citizen-consumer/reduce-reuse-recycle",
              repeatable: true,
            },
            {
              action: "Reuse takeaway containers for storage",
              impact: 75,
              costSaving: 50,
              guidance: "https://www.wrap.org.uk/taking-action/citizen-consumer/reduce-reuse-recycle",
              repeatable: true,
            },
            {
              action: "Hand-me-down and second-hand clothes",
              impact: 400,
              costSaving: 500,
              guidance: "https://www.wrap.org.uk/taking-action/textiles/re-use",
              repeatable: true,
            },
            {
              action: "Keep shopping bags in car/by door",
              impact: 50,
              costSaving: 30,
              guidance: "https://www.wrap.org.uk/taking-action/citizen-consumer/reduce-reuse-recycle",
            },
            {
              action: "Repair electrical items instead of replacing",
              impact: 300,
              costSaving: 400,
              guidance: "https://www.therestartproject.org/",
              repeatable: true,
            },
            {
              action: "Repurpose packaging for other uses",
              impact: 100,
              costSaving: 50,
              guidance: "https://www.wrap.org.uk/taking-action/citizen-consumer/reduce-reuse-recycle",
              repeatable: true,
            },
            {
              action: "Collect rainwater for garden use",
              impact: 150,
              costSaving: 80,
              guidance: "https://www.rhs.org.uk/garden-features/water-gardens/water-saving",
            },
            {
              action: "Grow own vegetables and herbs",
              impact: 200,
              costSaving: 300,
              guidance: "https://www.rhs.org.uk/vegetables",
              repeatable: true,
            },
            {
              action: "Offer food/clothes/furniture on Olio",
              impact: 150,
              costSaving: 0,
              guidance: "https://olioex.com/",
              repeatable: true,
              externalLink: "https://olioex.com/users/sign_up",
            },
            {
              action: "Check food expiry dates daily to prevent waste",
              impact: 5,
              costSaving: 8,
              frequency: "daily",
              guidance: "https://www.lovefoodhatewaste.com/article/food-storage-a-z",
            },
          ],
        };

  const labels = getLabels();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-foreground font-roboto">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-roboto">
      {/* Caerphilly Branding Header for Business Mode */}
      {mode === "business" && (
        <div className="bg-card/20 backdrop-blur-sm border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <img
                src={caerphillyBusinessLogo}
                alt="Caerphilly Business Club"
                className="h-10 w-10 bg-card rounded-full p-1"
              />
              <img src={caerphillyCouncilLogo} alt="Caerphilly Council" className="h-8 w-auto" />
              <span className="text-foreground text-sm">🌱 Local Benefits</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero section with avatar toggle */}
        <div className="text-center mb-12">
          <div
            className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 cursor-pointer hover:scale-110 transition-transform"
            onClick={() => setShowAvatarPanels(!showAvatarPanels)}
          >
            <Earth className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{labels.title}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">{labels.description}</p>
        </div>

        {/* Avatar panels and map - only show when clicked */}
        {showAvatarPanels && (
          <div className="animate-fade-in space-y-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AvatarSystem
                totalPoints={userProfile?.total_points || 0}
                userRenewables={userRenewables.length}
                pledgesCompleted={pledges.length}
              />
              <UserProgress
                currentFootprint={footprint}
                totalPoints={userProfile?.total_points || 0}
                pledgesCompleted={pledges.length}
                sprintsCompleted={sprints.filter((s) => s.completed).length}
                renewablesOwned={userRenewables.length}
                userMode={mode}
              />
            </div>

            {/* Caerphilly Interactive Map */}
            <CaerphillyMap
              userRenewables={userRenewables}
              totalPoints={userProfile?.total_points || 0}
              currentFootprint={footprint}
              onPlaceRenewable={handlePlaceRenewable}
            />
          </div>
        )}

        {/* Current footprint display */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-card backdrop-blur-sm rounded-2xl p-8 text-center border-2 border-border">
            <div className="text-5xl font-bold text-green-600 mb-2">{footprint.toLocaleString()}</div>
            <div className="text-foreground mb-2">kg CO₂/year</div>
            <div className="text-sm text-muted-foreground">Your current footprint</div>
          </div>
        </div>

        {/* World visualization */}
        <WorldsDisplay currentFootprint={footprint} pledges={pledges} sprints={sprints} mode={mode} />

        {/* Category sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-card backdrop-blur-sm rounded-2xl p-6 border-2 border-border hover:border-primary/50 transition-all duration-300"
            >
              <div className="mb-4">
                <category.iconComponent className="w-12 h-12 text-primary" strokeWidth={1} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{category.title}</h3>
              <p className="text-muted-foreground text-sm mb-6">{category.description}</p>
              <div className="space-y-2">
                <Button
                  onClick={() => handleCategoryClick(category.id)}
                  className={`w-full rounded-xl ${
                    completedCategories.includes(category.id)
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  {completedCategories.includes(category.id) ? "✓ Completed" : "Calculate"}
                </Button>

                {completedCategories.includes(category.id) && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCategoryClick(category.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm"
                    >
                      Retake
                    </Button>
                    <Button
                      onClick={() => handlePledgeClick(category.id)}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 rounded-xl text-sm"
                    >
                      Pledge to Reduce
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action tabs */}
        <Tabs value={activeView} onValueChange={setActiveView} className="mt-16">
          <TabsList className="grid w-full max-w-5xl mx-auto grid-cols-7 bg-slate-700/30 border border-slate-600">
            <TabsTrigger
              value="pledges"
              className="text-sm text-slate-200 data-[state=active]:bg-slate-600 data-[state=active]:text-white px-4 py-3 flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              <span className="hidden sm:inline">{labels.pledgesTab}</span>
            </TabsTrigger>
            <TabsTrigger
              value="sprints"
              className="text-sm text-slate-200 data-[state=active]:bg-slate-600 data-[state=active]:text-white px-4 py-3 flex items-center gap-2"
            >
              <Timer className="w-4 h-4" />
              <span className="hidden sm:inline">{labels.sprintsTab}</span>
            </TabsTrigger>
            <TabsTrigger
              value="shop"
              className="text-sm text-slate-200 data-[state=active]:bg-slate-600 data-[state=active]:text-white px-4 py-3 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Tech Shop</span>
            </TabsTrigger>
            <TabsTrigger
              value="knowledge"
              className="text-sm text-slate-200 data-[state=active]:bg-slate-600 data-[state=active]:text-white px-4 py-3 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Knowledge</span>
            </TabsTrigger>
            <TabsTrigger
              value="postcards"
              className="text-sm text-slate-200 data-[state=active]:bg-slate-600 data-[state=active]:text-white px-4 py-3 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">{labels.postcardsTab}</span>
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="text-sm text-slate-200 data-[state=active]:bg-slate-600 data-[state=active]:text-white px-4 py-3 flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="community"
              className="text-sm text-slate-200 data-[state=active]:bg-slate-600 data-[state=active]:text-white px-4 py-3 flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Community</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pledges" className="mt-8">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">{labels.pledgesTab}</CardTitle>
                <CardDescription className="text-slate-400">
                  {completedCategories.length === 0
                    ? "Complete questionnaires to unlock pledges for reducing your carbon footprint"
                    : "Make commitments to reduce your carbon footprint"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {completedCategories.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <div className="text-6xl mb-4">🔒</div>
                    <p className="text-lg mb-2">Pledges Locked</p>
                    <p className="text-sm">Complete at least one category assessment to unlock pledge options</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(pledgeCategories).map(([category, actions]) => (
                      <div key={category}>
                        <h3 className="text-lg font-semibold mb-3 capitalize text-white">{category}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {actions
                            .map((pledge, index) => {
                              const existingPledge = pledges.find(
                                (p) => p.action === pledge.action && p.category === category,
                              );
                              const isRepeatable =
                                pledge.frequency === "daily" || pledge.frequency === "weekly" || pledge.repeatable;

                              // Only show pledges that haven't been done OR are repeatable
                              if (existingPledge && !isRepeatable) {
                                return null; // Hide completed non-repeatable pledges
                              }

                              return (
                                <div key={index} className="relative">
                                  <Button
                                    variant="outline"
                                    className="h-auto p-3 text-left justify-start w-full bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 text-white"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (pledge.externalLink) {
                                        window.open(pledge.externalLink, "_blank");
                                      } else {
                                        addPledge(
                                          category,
                                          pledge.action,
                                          pledge.impact,
                                          pledge.frequency || "ongoing",
                                          pledge.costSaving || 0,
                                        );
                                      }
                                    }}
                                  >
                                    <div className="w-full pr-8">
                                      <div className="font-medium text-sm whitespace-normal break-words">
                                        {pledge.action}
                                        {isRepeatable && " 🔄"}
                                        {pledge.externalLink && " 🔗"}
                                      </div>
                                      <div className="text-xs text-slate-400">
                                        Save {pledge.impact} kg CO₂
                                        {pledge.frequency === "daily"
                                          ? "/day"
                                          : pledge.frequency === "weekly"
                                            ? "/week"
                                            : "/year"}
                                        {pledge.costSaving && pledge.costSaving > 0 && (
                                          <span className="text-green-400 ml-2 flex items-center gap-1">
                                            <PoundSterling className="w-3 h-3" strokeWidth={1} />£{pledge.costSaving}
                                            {pledge.frequency === "daily"
                                              ? "/day"
                                              : pledge.frequency === "weekly"
                                                ? "/week"
                                                : "/year"}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </Button>
                                  {pledge.guidance && (
                                    <a
                                      href={pledge.guidance}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="absolute top-2 right-2 text-xs text-blue-400 hover:text-blue-300 underline"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Guide
                                    </a>
                                  )}
                                </div>
                              );
                            })
                            .filter(Boolean)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {pledges.length > 0 && (
                  <div className="mt-6 p-4 bg-green-900/30 rounded-lg border border-green-800">
                    <h3 className="font-semibold mb-2 text-white">Your Completed Pledges:</h3>
                    <div className="space-y-2">
                      {(() => {
                        // Group pledges by action and count them
                        const groupedPledges = pledges.reduce(
                          (acc, pledge) => {
                            const key = pledge.action;
                            if (!acc[key]) {
                              acc[key] = {
                                ...pledge,
                                count: 1,
                                totalImpact: pledge.impact,
                                totalCostSaving: pledge.costSaving || 0,
                              };
                            } else {
                              acc[key].count += 1;
                              acc[key].totalImpact += pledge.impact;
                              acc[key].totalCostSaving += pledge.costSaving || 0;
                            }
                            return acc;
                          },
                          {} as Record<string, any>,
                        );

                        return Object.values(groupedPledges).map((groupedPledge: any) => (
                          <div key={groupedPledge.action} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                                {groupedPledge.category}
                              </Badge>
                              <span className="text-sm text-slate-300">{groupedPledge.action}</span>
                              {groupedPledge.count > 1 && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-900/50 border-blue-600 text-blue-300 text-xs px-2 py-1"
                                >
                                  x{groupedPledge.count}
                                </Badge>
                              )}
                            </div>
                            <div className="text-right text-xs">
                              <div className="text-green-400">-{groupedPledge.totalImpact}kg CO₂</div>
                              {groupedPledge.totalCostSaving > 0 && (
                                <div className="text-yellow-400 flex items-center gap-1">
                                  <PoundSterling className="w-3 h-3" strokeWidth={1} />£{groupedPledge.totalCostSaving}
                                  /year
                                </div>
                              )}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sprints" className="mt-8">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">{labels.sprintsTab}</CardTitle>
                <CardDescription className="text-slate-400">Quick actions you can take this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Duration Selection */}
                  <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                    <h4 className="text-white font-medium mb-3">Sprint Duration</h4>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-300 text-sm">Choose duration:</span>
                      <Select
                        value={sprintDuration.toString()}
                        onValueChange={(value) => setSprintDuration(parseInt(value))}
                      >
                        <SelectTrigger className="w-32 bg-slate-600 border-slate-500 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="1" className="text-white hover:bg-slate-600">
                            1 day
                          </SelectItem>
                          <SelectItem value="3" className="text-white hover:bg-slate-600">
                            3 days
                          </SelectItem>
                          <SelectItem value="7" className="text-white hover:bg-slate-600">
                            7 days
                          </SelectItem>
                          <SelectItem value="14" className="text-white hover:bg-slate-600">
                            14 days
                          </SelectItem>
                          <SelectItem value="30" className="text-white hover:bg-slate-600">
                            30 days
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="text-xs text-slate-400">
                        Multiplier:{" "}
                        {sprintDuration <= 1
                          ? "0.5x"
                          : sprintDuration <= 3
                            ? "1x"
                            : sprintDuration <= 7
                              ? "1.5x"
                              : sprintDuration <= 14
                                ? "2x"
                                : "2.5x"}{" "}
                        points
                      </div>
                    </div>
                  </div>

                  {/* Sprint Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mode === "business" ? (
                      <>
                        <Button
                          variant="outline"
                          className="bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 text-white"
                          onClick={() => addSprint("Office energy audit", 800, "weekly", 300)}
                        >
                          Energy Audit Sprint
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 text-white"
                          onClick={() => addSprint("Zero waste office challenge", 600, "weekly", 200)}
                        >
                          Zero Waste Sprint
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 text-white"
                          onClick={() => addSprint("Sustainable commuting challenge", 1200, "weekly", 400)}
                        >
                          Transport Sprint
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 text-white"
                          onClick={() => addSprint("Green procurement review", 1000, "weekly", 500)}
                        >
                          Procurement Sprint
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 text-white"
                          onClick={() => addSprint("Home energy audit", 300, "weekly", 120)}
                        >
                          Energy Audit Sprint
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 text-white"
                          onClick={() => addSprint("Zero waste challenge", 200, "weekly", 80)}
                        >
                          Zero Waste Sprint
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 text-white"
                          onClick={() => addSprint("Sustainable transport challenge", 400, "weekly", 150)}
                        >
                          Transport Sprint
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 text-white"
                          onClick={() => addSprint("Plant-based meals challenge", 500, "weekly", 100)}
                        >
                          Plant-Based Sprint
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Active Sprints with Countdown */}
                  {sprints.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <h3 className="font-semibold text-white">Your Active Sprints:</h3>
                      {sprints.map((sprint) => {
                        const { daysLeft, progress, isExpired, countdown } = getSprintProgress(sprint);

                        return (
                          <div key={sprint.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-3">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {/* Circular Progress Indicator */}
                                <div className="relative w-12 h-12 flex-shrink-0">
                                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                      className="text-slate-600"
                                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1"
                                    />
                                    <path
                                      className={
                                        sprint.completed
                                          ? "text-green-500"
                                          : isExpired
                                            ? "text-red-500"
                                            : "text-yellow-500"
                                      }
                                      strokeDasharray={`${sprint.completed ? 100 : progress}, 100`}
                                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1"
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-bold text-white">
                                      {sprint.completed ? "✓" : isExpired ? "✗" : daysLeft}
                                    </span>
                                  </div>
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div
                                    className={`font-medium text-white text-sm ${sprint.completed ? "line-through text-slate-400" : ""}`}
                                  >
                                    {sprint.title}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1 mt-2">
                                    <Badge variant="outline" className="text-xs bg-slate-600 text-slate-200">
                                      {sprint.impact} kg CO₂ saved
                                    </Badge>
                                    <Badge variant="outline" className="text-xs bg-purple-600 text-purple-200">
                                      {sprint.points} points
                                    </Badge>
                                    {sprint.costSaving && sprint.costSaving > 0 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-green-600 text-green-200 flex items-center gap-1"
                                      >
                                        <PoundSterling className="w-3 h-3" strokeWidth={1} />£{sprint.costSaving} saved
                                      </Badge>
                                    )}
                                    {sprint.duration && (
                                      <Badge variant="outline" className="text-xs bg-blue-600 text-blue-200">
                                        {sprint.duration} days
                                      </Badge>
                                    )}
                                  </div>
                                  {!sprint.completed && !isExpired && (
                                    <div className="space-y-1 mt-2">
                                      <div className="text-xs text-slate-400">
                                        {daysLeft === 1 ? "Last day!" : `${daysLeft} days remaining`}
                                      </div>
                                      <div className="text-xs font-mono text-yellow-400 bg-slate-800 px-2 py-1 rounded">
                                        ⏱️ {countdown}
                                      </div>
                                    </div>
                                  )}
                                  {isExpired && !sprint.completed && (
                                    <div className="text-xs text-red-400 mt-1">Sprint expired</div>
                                  )}
                                </div>
                              </div>

                              {!sprint.completed && !isExpired && (
                                <Button
                                  size="sm"
                                  onClick={() => completeSprint(sprint.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0"
                                >
                                  Complete
                                </Button>
                              )}
                            </div>

                            {/* Progress Bar */}
                            {!sprint.completed && (
                              <div className="w-full">
                                <Progress value={progress} className="h-2 bg-slate-600" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shop" className="mt-8">
            <RenewableShop
              totalPoints={userProfile?.total_points || 0}
              userRenewables={userRenewables}
              onPurchase={handleRenewablePurchase}
            />
          </TabsContent>

          <TabsContent value="knowledge" className="mt-8">
            <KnowledgeBase userProfile={userProfile} setUserProfile={setUserProfile} />
          </TabsContent>

          <TabsContent value="postcards" className="mt-8">
            <PostcardsFromFuture currentFootprint={footprint} pledges={pledges} sprints={sprints} />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-8">
            <Leaderboard />
          </TabsContent>

          <TabsContent value="community" className="mt-8">
            <CommunityStories />
          </TabsContent>
        </Tabs>

        {/* Questionnaire Modal */}
        {showQuestionnaire && (
          <CategoryQuestionnaire
            category={categories.find((cat) => cat.id === showQuestionnaire)!}
            onComplete={handleQuestionnaireComplete}
            onClose={handleQuestionnaireClose}
            user={user}
          />
        )}
      </div>

      {/* Mode Toggle at Bottom */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="bg-card backdrop-blur-sm border-2 border-border rounded-2xl p-8">
          <h3 className="text-foreground text-lg font-semibold mb-4 text-center">Switch Mode</h3>
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-foreground" />
              <span
                className={`text-lg transition-colors ${mode === "resident" ? "font-bold text-foreground" : "text-muted-foreground"}`}
              >
                Resident
              </span>
            </div>
            <Switch
              checked={mode === "business"}
              onCheckedChange={(checked) => {
                console.log("Toggle clicked:", checked);
                handleModeChange(checked ? "business" : "resident");
              }}
              className="scale-150"
              disabled={false}
            />
            <div className="flex items-center gap-3">
              <span
                className={`text-lg transition-colors ${mode === "business" ? "font-bold text-foreground" : "text-muted-foreground"}`}
              >
                Business
              </span>
              <Building className="w-5 h-5 text-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Button */}
      <div className="flex justify-center pb-8">
        <Button
          onClick={() => (window.location.href = "/dashboard")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold rounded-xl"
        >
          View Dashboard
        </Button>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} mode={mode} onModeChange={handleModeChange} />
    </div>
  );
};

export default WasteCalculator;
