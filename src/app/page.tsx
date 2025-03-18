"use client";

import {useEffect, useState} from "react";
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import TrustedBySection from "@/components/landing/TrustedBySection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import DemoSection from "@/components/landing/DemoSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import CTASection from "@/components/landing/CTASection";
import FAQSection from "@/components/landing/FAQSection";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header/>
      <main className="flex-1">
        <HeroSection/>
        <TrustedBySection/>
        <FeaturesSection/>
        <BenefitsSection/>
        <DemoSection/>
        <TestimonialsSection/>
        <PricingSection/>
        <CTASection/>
        <FAQSection/>
        <ContactSection/>
      </main>
      <Footer/>
    </div>
  );
}
