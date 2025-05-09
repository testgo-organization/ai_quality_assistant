
import React, { useState } from "react";
import {
  getMockContactReasons,
  getMockSentimentData,
  getMockSatisfactionTrend,
  getMockFrictionPoints,
  getMockSatisfactionPoints,
  getMockJourneyData,
  getMockChannelUsage,
  getMockHourlyDistribution
} from "@/components/charts/utils";

// Import the new component sections
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KPISection from "@/components/dashboard/KPISection";
import ContactAndSentimentSection from "@/components/dashboard/ContactAndSentimentSection";
import SatisfactionTrendSection from "@/components/dashboard/SatisfactionTrendSection";
import FrictionSatisfactionSection from "@/components/dashboard/FrictionSatisfactionSection";
import ChannelDistributionSection from "@/components/dashboard/ChannelDistributionSection";
import CustomerJourneySection from "@/components/dashboard/CustomerJourneySection";

const Dashboard = () => {
  const [period, setPeriod] = useState("month");
  
  // Load mock data using our utility functions
  const contactReasons = getMockContactReasons();
  const sentimentData = getMockSentimentData();
  const satisfactionTrend = getMockSatisfactionTrend();
  const frictionPoints = getMockFrictionPoints();
  const satisfactionPoints = getMockSatisfactionPoints();
  const journeyData = getMockJourneyData();
  const channelUsage = getMockChannelUsage();
  const hourlyDistribution = getMockHourlyDistribution();
  
  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Dashboard Header */}
        <DashboardHeader period={period} setPeriod={setPeriod} />
        
        {/* KPI Cards */}
        <KPISection />
        
        {/* Charts - Row 1 */}
        <ContactAndSentimentSection 
          contactReasons={contactReasons} 
          sentimentData={sentimentData} 
        />
        
        {/* Charts - Row 2 */}
        <SatisfactionTrendSection satisfactionTrend={satisfactionTrend} />
        
        {/* Friction & Satisfaction Points */}
        <FrictionSatisfactionSection 
          frictionPoints={frictionPoints} 
          satisfactionPoints={satisfactionPoints} 
        />
        
        {/* Channel & Time Distribution */}
        <ChannelDistributionSection 
          channelUsage={channelUsage} 
          hourlyDistribution={hourlyDistribution} 
        />
        
        {/* Customer Journey */}
        <CustomerJourneySection journeyData={journeyData} />
      </div>
    </div>
  );
};

export default Dashboard;
