import React from "react";
import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type Faq = { question: string; answer: string };

function buildFaqs(annualFee: number): Faq[] {
  return [
    {
      question: "How do I add more people to my membership?",
      answer:
        "Speak with our gym staff at the front desk and they will add them for you. Once they are added, each person has their own account and their own barcode.",
    },
    {
      question: "What does the Group membership include?",
      answer:
        "The Group membership covers up to 5 people and is billed to one person. Everyone on it is added by gym staff, and each member gets their own account and barcode.",
    },
    {
      question: "What does the Couples membership include?",
      answer:
        "The Couples membership gives two people full access to the gym and classes. Your partner is added by gym staff, and each of you has your own account and barcode.",
    },
    {
      question: "Does everyone on a Group or Couples membership get their own barcode?",
      answer:
        "Yes. Every person added to a membership has their own account and barcode, so each member checks in on their own.",
    },
    {
      question: "How do the Regular memberships work?",
      answer: `Regular memberships are billed monthly, renew automatically and come with a 1-year commitment. There is also a $${annualFee} annual fee on top of the monthly price.`,
    },
    {
      question: "Do the Daily, Weekly and Monthly passes have an annual fee?",
      answer: "No. The Provisional passes are short-term and carry no annual fee.",
    },
    {
      question: "Are the prices shown before tax?",
      answer: "Yes. All prices are shown before 13% HST, which is added at checkout.",
    },
    {
      question: "Is there a discount for emergency service workers?",
      answer: "Yes. Emergency service workers are eligible for a discounted membership. Show proof at the front desk.",
    },
  ];
}

export default function MembershipFaq({ annualFee }: { annualFee: number }) {
  const faqs = buildFaqs(annualFee);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="mt-8 border-2 border-secondary text-secondary hover:bg-secondary hover:text-white rounded-none uppercase font-bold tracking-wider gap-2"
          data-testid="membership-faq-open"
        >
          <CircleHelp className="w-5 h-5" /> Membership Q &amp; A
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" data-testid="membership-faq">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-secondary uppercase">Membership Q &amp; A</DialogTitle>
          <DialogDescription>Quick answers about our memberships, including Group and Couples.</DialogDescription>
        </DialogHeader>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left font-semibold text-secondary">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}
