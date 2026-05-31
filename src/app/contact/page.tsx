'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, Mail, Phone, Instagram, Send, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().optional(),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      toast({
        title: 'Message Sent!',
        description: 'Thank you for contacting us. We will get back to you shortly.',
      });
      form.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen pt-36 md:pt-40 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold font-heading mb-4 text-stone-900 dark:text-white"
          >
            Get in <span className="text-primary">Touch</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto"
          >
            Have a question, feedback, or need help with an order? We're here for you. Drop us a line and we'll get back to you as soon as possible.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 shadow-xl border border-stone-100 dark:border-stone-800">
              <h2 className="text-2xl font-bold font-heading mb-6 text-stone-900 dark:text-white">Contact Information</h2>
              
              <div className="space-y-6">
                <a href="mailto:admin@grillsjunction.com.ng" className="flex items-start gap-4 p-4 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group">
                  <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Mail className="w-6 h-6 text-primary group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 dark:text-white mb-1">Email Us</h3>
                    <p className="text-stone-600 dark:text-stone-400 text-sm">admin@grillsjunction.com.ng</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-4 rounded-2xl">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 dark:text-white mb-1">Our Location</h3>
                    <p className="text-stone-600 dark:text-stone-400 text-sm mb-3">Lagos, Nigeria</p>
                    <a 
                      href="https://maps.app.goo.gl/h59fc4rasj68KjYu5" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      Open in Google Maps <MapPin className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
                  <h3 className="font-bold text-stone-900 dark:text-white mb-4">Follow Us</h3>
                  <div className="flex gap-4">
                    <a 
                      href="https://www.instagram.com/grillsjunction/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-stone-100 dark:bg-stone-800 p-4 rounded-2xl hover:bg-primary hover:text-white transition-all transform hover:scale-105"
                    >
                      <Instagram className="w-6 h-6" />
                    </a>
                    <a 
                      href="https://www.tiktok.com/@grillsjunction" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-stone-100 dark:bg-stone-800 px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary hover:text-white transition-all transform hover:scale-105"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-current">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 11.14 4.15c.08-.12.15-.25.21-.39V10.2a8.3 8.3 0 0 0 3.24.66z" />
                      </svg>
                      TikTok
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-stone-900 rounded-3xl p-8 shadow-xl border border-stone-100 dark:border-stone-800"
          >
            <h2 className="text-2xl font-bold font-heading mb-6 text-stone-900 dark:text-white">Send a Message</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} className="rounded-xl bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" type="email" {...field} className="rounded-xl bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" type="tel" {...field} className="rounded-xl bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800">
                              <SelectValue placeholder="What is this about?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Having issues placing order">Having issues placing order</SelectItem>
                            <SelectItem value="Order Tracking">Order Tracking</SelectItem>
                            <SelectItem value="Feedback">Feedback</SelectItem>
                            <SelectItem value="Catering & Events">Catering & Events</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="How can we help you?" 
                          className="min-h-[150px] rounded-xl bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 resize-y"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full rounded-xl h-14 text-lg font-bold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
