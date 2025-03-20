
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Upload, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/services/authService";
import { 
  saveUserProfile, 
  getUserProfile, 
  saveDocuments, 
  ProfileStatus, 
  UserProfile 
} from "@/services/profileService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const phoneRegex = /^\+49\s?[1-9][0-9]{1,14}$/;

const profileFormSchema = z.object({
  firstName: z.string().min(2, { message: "Vorname muss mindestens 2 Zeichen lang sein" }),
  lastName: z.string().min(2, { message: "Nachname muss mindestens 2 Zeichen lang sein" }),
  email: z.string().email({ message: "Ungültige E-Mail-Adresse" }),
  phone: z.string().regex(phoneRegex, { message: "Telefonnummer muss im Format +49 beginnen" }),
  birthDate: z.date({ required_error: "Geburtsdatum ist erforderlich" }),
  street: z.string().min(2, { message: "Straße ist erforderlich" }),
  houseNumber: z.string().min(1, { message: "Hausnummer ist erforderlich" }),
  zipCode: z.string().min(5, { message: "Postleitzahl muss mindestens 5 Zeichen lang sein" }),
  city: z.string().min(2, { message: "Ort ist erforderlich" }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const statusConfig = {
  incomplete: {
    label: "Nicht vollständig",
    color: "bg-yellow-500/10 text-yellow-500",
    icon: AlertCircle
  },
  submitted: {
    label: "Eingereicht",
    color: "bg-blue-500/10 text-blue-500",
    icon: Clock
  },
  reviewing: {
    label: "Wird überprüft",
    color: "bg-purple-500/10 text-purple-500",
    icon: Clock
  },
  approved: {
    label: "Bestätigt",
    color: "bg-green-500/10 text-green-500",
    icon: CheckCircle
  },
  rejected: {
    label: "Abgelehnt",
    color: "bg-red-500/10 text-red-500",
    icon: AlertCircle
  }
};

const ProfileForm = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>("incomplete");
  const [idDocuments, setIdDocuments] = useState<File[]>([]);
  const [cardDocuments, setCardDocuments] = useState<File[]>([]);
  const [bankDocuments, setBankDocuments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get current user
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/");
      return;
    }
    setUserId(user.id);
    
    // Load profile data if exists
    const fetchProfile = async () => {
      if (user.id) {
        const profile = await getUserProfile(user.id);
        if (profile) {
          form.reset({
            ...profile,
            birthDate: profile.birthDate ? new Date(profile.birthDate) : new Date(),
          });
          setIsSubmitted(profile.isSubmitted || false);
          setProfileStatus(profile.status || "incomplete");
        }
      }
    };
    
    fetchProfile();
  }, [navigate]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "+49 ",
      street: "",
      houseNumber: "",
      zipCode: "",
      city: "",
    },
  });

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
  ) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(file => {
        const isValid = file.type === "application/pdf" || 
                       file.type === "image/png" || 
                       file.type === "image/jpeg";
        if (!isValid) {
          toast({
            title: "Ungültiges Dateiformat",
            description: "Bitte nur PDF, PNG oder JPG Dateien hochladen.",
            variant: "destructive",
          });
        }
        return isValid;
      });
      setFiles(validFiles);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!userId) return;
    setIsLoading(true);
    
    if (idDocuments.length === 0 || cardDocuments.length === 0 || bankDocuments.length === 0) {
      toast({
        title: "Dokumente fehlen",
        description: "Bitte laden Sie alle erforderlichen Dokumente hoch.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      // Save documents first
      const docsUploaded = await saveDocuments(userId, idDocuments, cardDocuments, bankDocuments);
      
      if (!docsUploaded) {
        toast({
          title: "Fehler beim Hochladen",
          description: "Ihre Dokumente konnten nicht gespeichert werden.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Save profile data with updated status
      const updatedProfile: UserProfile = {
        ...data,
        isSubmitted: true,
        status: "submitted"
      };
      
      const success = await saveUserProfile(userId, updatedProfile);
      
      if (success) {
        setIsSubmitted(true);
        setProfileStatus("submitted");
        toast({
          title: "Profil gespeichert",
          description: "Ihre Daten wurden erfolgreich gespeichert und zur Überprüfung eingereicht.",
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Fehler beim Speichern",
        description: "Ihre Daten konnten nicht gespeichert werden. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const StatusBadge = ({ status }: { status: ProfileStatus }) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.color} animate-fade-in`}>
        <Icon className="h-4 w-4" />
        {config.label}
      </div>
    );
  };

  const isEditable = !isSubmitted || profileStatus === "rejected";

  return (
    <div className="space-y-6 animate-fade-in">
      <Alert className="glass-morphism">
        <AlertTitle className="font-medium">Wichtige Information</AlertTitle>
        <AlertDescription className="text-sm">
          Diese Daten werden für MatchedBetting-Zwecke verwendet. Bitte lesen Sie alle Informationen sorgfältig durch, bevor Sie Ihre Daten hochladen. Laden Sie Ihre Dokumente erst hoch, nachdem Sie Ihr Bankkonto eröffnet haben, damit wir direkt starten können. Wir werden Sie kontaktieren, um uns in Ihr Bankkonto einzuloggen, welches danach wieder geschlossen wird.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium">Persönliche Daten</h2>
        <StatusBadge status={profileStatus} />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="glass-morphism overflow-hidden">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg font-medium">Persönliche Informationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vorname</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} className="bg-white/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nachname</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} className="bg-white/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-Mail</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" disabled={!isEditable} className="bg-white/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefonnummer</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+49 " disabled={!isEditable} className="bg-white/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Geburtsdatum</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-white/50",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={!isEditable}
                          >
                            {field.value ? (
                              format(field.value, "dd.MM.yyyy")
                            ) : (
                              <span>Datum auswählen</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1920-01-01")
                          }
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Straße</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} className="bg-white/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="houseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hausnummer</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} className="bg-white/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postleitzahl</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} className="bg-white/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ort</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditable} className="bg-white/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism overflow-hidden">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg font-medium">Dokumentenupload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label htmlFor="idDocuments">Ausweis (Vorder- und Rückseite + Foto mit Ausweis in der Hand)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="idDocuments"
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleFileUpload(e, setIdDocuments)}
                    disabled={!isEditable}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 bg-white/50"
                  />
                  <span className="text-sm text-muted-foreground">
                    {idDocuments.length} Dateien ausgewählt
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Die Schrift muss auf allen Bildern gut lesbar sein.</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="cardDocuments">Zahlungskarten (Giro-, Debit- oder Kreditkarte, Vorder- und Rückseite)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="cardDocuments"
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleFileUpload(e, setCardDocuments)}
                    disabled={!isEditable}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 bg-white/50"
                  />
                  <span className="text-sm text-muted-foreground">
                    {cardDocuments.length} Dateien ausgewählt
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="bankDocuments">Bankdokumente (mit allen relevanten Codes)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="bankDocuments"
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleFileUpload(e, setBankDocuments)}
                    disabled={!isEditable}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 bg-white/50"
                  />
                  <span className="text-sm text-muted-foreground">
                    {bankDocuments.length} Dateien ausgewählt
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            className="w-full transition-all hover:scale-[1.01] duration-200" 
            disabled={!isEditable || isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner mr-2 h-4 w-4" /> Wird gespeichert...
              </>
            ) : isSubmitted ? (
              "Daten wurden eingereicht"
            ) : (
              "Daten bestätigen und einreichen"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ProfileForm;
