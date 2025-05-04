import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TokenizationFormData } from "@/types";
import { algorandService } from "@/services/algorandService";
import { useAlgorand } from "@/hooks/useAlgorand";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

// Define form schema with zod
const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  ipType: z.enum(["patent", "copyright", "trademark", "trade_secret"]),
  totalSupply: z.number().min(1, { message: "Supply must be at least 1" }),
  royaltyPercentage: z.number().min(0, { message: "Royalty must be at least 0%" }).max(25, { message: "Royalty cannot exceed 25%" }),
  price: z.number().min(0.1, { message: "Price must be at least 0.1 ALGO" }),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const TokenizationForm = () => {
  const { connected } = useAlgorand();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      ipType: "patent",
      totalSupply: 1000000,
      royaltyPercentage: 5,
      price: 1,
      metadata: {},
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Format the data for the API call ensuring all required fields are included
      const formData: TokenizationFormData = {
        name: data.name,
        description: data.description,
        ipType: data.ipType,
        totalSupply: data.totalSupply,
        royaltyPercentage: data.royaltyPercentage,
        price: data.price,
        metadata: data.metadata || {},
      };
      
      // Call the mock service to create the token
      const newToken = await algorandService.createIPToken(formData);
      
      toast.success("IP successfully tokenized", {
        description: `Your intellectual property "${data.name}" has been tokenized.`,
      });
      
      // Navigate to the token details page
      navigate(`/token/${newToken.id}`);
    } catch (error) {
      console.error("Failed to tokenize IP:", error);
      toast.error("Failed to tokenize IP", {
        description: "There was an error processing your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Tokenize Your Intellectual Property</h1>
      <p className="text-muted-foreground mb-8">
        Convert your intellectual property into a tradable digital asset on the Algorand blockchain.
      </p>
      
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Basic Information</h2>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IP Asset Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the name of your IP asset" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be the public name of your tokenized intellectual property.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your intellectual property..." {...field} className="min-h-24" />
                    </FormControl>
                    <FormDescription>
                      Provide details about your IP asset, its value proposition, and potential applications.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ipType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IP Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select IP type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="patent">Patent</SelectItem>
                        <SelectItem value="copyright">Copyright</SelectItem>
                        <SelectItem value="trademark">Trademark</SelectItem>
                        <SelectItem value="trade_secret">Trade Secret</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the type of intellectual property you are tokenizing.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Token Economics</h2>
              
              <FormField
                control={form.control}
                name="totalSupply"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Token Supply</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Define the total number of tokens that will represent your IP asset.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Token Price (ALGO)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Set the initial price per token in Algorand's native currency (ALGO).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="royaltyPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Royalty Percentage: {field.value}%</FormLabel>
                    <FormControl>
                      <Slider 
                        defaultValue={[field.value]} 
                        min={0} 
                        max={25} 
                        step={0.1} 
                        onValueChange={(values) => field.onChange(values[0])}
                        className="py-4" 
                      />
                    </FormControl>
                    <FormDescription>
                      Define the percentage of future sales that will be paid as royalties to token holders.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="pt-4 flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-ip-purple-500 hover:bg-ip-purple-600 min-w-32"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Tokenize IP"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default TokenizationForm;
