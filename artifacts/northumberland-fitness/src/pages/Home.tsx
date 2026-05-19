import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Activity, Users, HeartPulse, Clock, MapPin, Phone, Mail, ArrowRight } from "lucide-react";

export default function Home() {
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="w-full">
        <HeroSlider />
      </section>

      {/* About Us */}
      <section id="about" className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 variants={itemVariant} className="text-4xl md:text-5xl font-serif text-secondary mb-6">
              Welcome to Northumberland Fitness
            </motion.h2>
            <motion.div variants={itemVariant} className="w-24 h-2 bg-primary mx-auto mb-8"></motion.div>
            <motion.p variants={itemVariant} className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Welcome to Northumberland Fitness, a modern fitness club built for real people, real goals, and real progress. We combine a clean, well-maintained environment with high-quality equipment, certified trainers, and a supportive community that keeps you motivated every step of the way.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8 mt-16"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {[
              {
                icon: Dumbbell,
                title: "Train With Confidence",
                body: "Our facility is designed to help you move safely and effectively. From spotless workout areas to regularly maintained machines, we make sure your focus stays on your goals — not the equipment."
              },
              {
                icon: Activity,
                title: "Everything You Need to Succeed",
                body: "Whether you're lifting, running, stretching, or training for performance, our wide range of cardio machines, free weights, resistance equipment, and functional tools supports every style of fitness."
              },
              {
                icon: Users,
                title: "Guidance From Professionals",
                body: "Our certified trainers and knowledgeable staff are here to help you train smarter, improve technique, and get results that last."
              }
            ].map((item, idx) => (
              <motion.div key={idx} variants={itemVariant} className="flex flex-col items-center text-center p-8 border-t-4 border-primary bg-muted">
                <div className="w-14 h-14 bg-secondary flex items-center justify-center mb-5">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-serif text-secondary mb-3 uppercase">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section id="mission" className="py-24 bg-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-fixed bg-center"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div 
            className="grid md:grid-cols-2 gap-12"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={itemVariant} className="bg-secondary-foreground/5 p-10 border-l-4 border-primary backdrop-blur-sm">
              <h3 className="text-3xl font-serif mb-4 text-primary">Our Mission</h3>
              <p className="text-lg text-white/80 leading-relaxed">
                To provide a clean, safe, and motivating fitness environment where individuals of all ages and experience levels can pursue their health and wellness goals with confidence. We are committed to delivering exceptional service, professional guidance, and a community-driven atmosphere that inspires long-term success.
              </p>
            </motion.div>
            <motion.div variants={itemVariant} className="bg-secondary-foreground/5 p-10 border-l-4 border-accent backdrop-blur-sm">
              <h3 className="text-3xl font-serif mb-4 text-accent">Our Vision</h3>
              <p className="text-lg text-white/80 leading-relaxed">
                To become Northumberland County's leading fitness destination — recognized for our high standards, modern facility, and member-first approach. We aim to empower our community through accessible fitness, expert support, and a culture built on positivity, respect, and continuous improvement. Fitness for All!!!
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-secondary mb-4">Elite Programs</h2>
            <div className="w-24 h-2 bg-primary mx-auto"></div>
          </div>

          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {[
              { icon: Dumbbell, title: "Strength Training", desc: "Build raw power and muscle mass with our extensive free weights area and guided coaching." },
              { icon: Activity, title: "HIIT", desc: "High-intensity interval training designed to torch calories and boost cardiovascular endurance." },
              { icon: HeartPulse, title: "Cardio Zone", desc: "State-of-the-art treadmills, rowers, and bikes to keep your heart healthy and stamina high." },
              { icon: Users, title: "Group Classes", desc: "Join our energetic group sessions ranging from spin to mobility and core strength." }
            ].map((prog, idx) => (
              <motion.div key={idx} variants={itemVariant}>
                <Card className="h-full bg-white border-none shadow-lg hover:-translate-y-2 transition-transform duration-300 group">
                  <CardContent className="p-8 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-muted rounded-none flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300">
                      <prog.icon className="w-8 h-8 text-secondary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="text-2xl font-serif text-secondary mb-3 uppercase">{prog.title}</h3>
                    <p className="text-muted-foreground">{prog.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Club Hours */}
      <section id="hours" className="py-24 bg-muted">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            className="max-w-3xl mx-auto bg-white p-8 md:p-12 shadow-xl border-t-8 border-primary"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={itemVariant} className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-serif text-secondary mb-4 flex items-center justify-center gap-3">
                <Clock className="w-8 h-8 text-primary" /> Club Hours
              </h2>
              <p className="text-muted-foreground">Train on your schedule. We're open when you need us.</p>
            </motion.div>

            <motion.div variants={itemVariant} className="space-y-4">
              {[
                { day: "Monday - Friday", hours: "5:00 AM - 11:00 PM" },
                { day: "Saturday", hours: "6:00 AM - 9:00 PM" },
                { day: "Sunday", hours: "7:00 AM - 8:00 PM" },
                { day: "Public Holidays", hours: "8:00 AM - 4:00 PM" }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-4 border-b border-border last:border-0">
                  <span className="text-lg font-semibold text-secondary">{item.day}</span>
                  <span className="text-lg text-accent font-medium">{item.hours}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact & Register Split */}
      <section className="bg-secondary text-white">
        <div className="grid lg:grid-cols-2">
          
          {/* Contact */}
          <div id="contact" className="py-24 px-8 md:px-16 lg:px-24">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2 variants={itemVariant} className="text-4xl font-serif mb-4 text-primary">Get In Touch</motion.h2>
              <motion.p variants={itemVariant} className="text-white/80 mb-10">Have questions? Reach out to our team.</motion.p>
              
              <motion.div variants={itemVariant} className="space-y-6 mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 flex items-center justify-center text-primary">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold uppercase text-sm text-white/60">Location</h4>
                    <p>123 Iron Avenue, Northumberland</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 flex items-center justify-center text-primary">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold uppercase text-sm text-white/60">Phone</h4>
                    <p>+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 flex items-center justify-center text-primary">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold uppercase text-sm text-white/60">Email</h4>
                    <p>info@northumberlandfitness.com</p>
                  </div>
                </div>
              </motion.div>

              <motion.form variants={itemVariant} className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <Input placeholder="Your Name" className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-none focus-visible:ring-primary" />
                <Input placeholder="Your Email" type="email" className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-none focus-visible:ring-primary" />
                <Textarea placeholder="Your Message" className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[120px] rounded-none focus-visible:ring-primary" />
                <Button type="button" className="w-full bg-accent hover:bg-accent/90 text-white rounded-none h-12 uppercase font-bold tracking-wider" data-testid="contact-submit">
                  Send Message
                </Button>
              </motion.form>
            </motion.div>
          </div>

          {/* Register */}
          <div id="register" className="py-24 px-8 md:px-16 lg:px-24 bg-white text-secondary relative">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="relative z-10"
            >
              <motion.h2 variants={itemVariant} className="text-5xl font-serif mb-4 uppercase text-secondary">Join The Club</motion.h2>
              <motion.p variants={itemVariant} className="text-secondary/80 mb-10 text-lg font-medium">Ready to start? Sign up for a membership today.</motion.p>

              <motion.form variants={itemVariant} className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input placeholder="First Name" className="bg-muted border-secondary/30 text-secondary placeholder:text-secondary/50 h-14 rounded-none focus-visible:ring-secondary text-lg" />
                    <Input placeholder="Last Name" className="bg-muted border-secondary/30 text-secondary placeholder:text-secondary/50 h-14 rounded-none focus-visible:ring-secondary text-lg" />
                  </div>
                  <Input placeholder="Email Address" type="email" className="bg-muted border-secondary/30 text-secondary placeholder:text-secondary/50 h-14 rounded-none focus-visible:ring-secondary text-lg" />
                  <Input placeholder="Phone Number" type="tel" className="bg-muted border-secondary/30 text-secondary placeholder:text-secondary/50 h-14 rounded-none focus-visible:ring-secondary text-lg" />
                  
                  <Select>
                    <SelectTrigger className="bg-muted border-secondary/30 text-secondary h-14 rounded-none focus:ring-secondary text-lg">
                      <SelectValue placeholder="Select Membership Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic - Access to gym floor</SelectItem>
                      <SelectItem value="premium">Premium - Gym floor & classes</SelectItem>
                      <SelectItem value="elite">Elite - All access + personal training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="button" size="lg" className="w-full bg-secondary hover:bg-secondary/90 text-white rounded-none h-16 text-xl uppercase font-bold tracking-wider flex gap-2 items-center" data-testid="register-submit">
                  Secure Your Spot <ArrowRight className="w-6 h-6" />
                </Button>
              </motion.form>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 text-foreground/60 text-center border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-2xl font-serif font-bold text-secondary uppercase tracking-wider mb-6">
            Northumberland <span className="text-primary">Fitness</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm font-medium uppercase tracking-wider">
            {["Home", "About Us", "Programs", "Club Hours", "Contact"].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().split(" ")[0]}`} 
                className="hover:text-primary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.toLowerCase().split(" ")[0])?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {item}
              </a>
            ))}
          </div>
          <p className="text-sm">© 2026 Northumberland Fitness. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
