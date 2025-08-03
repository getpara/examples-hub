import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto py-8 px-4 flex-1 flex flex-col items-center justify-center min-h-screen">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="pt-8">
          <FileQuestion className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription>The page you&apos;re looking for doesn&apos;t exist or has been moved.</CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <p className="text-muted-foreground">
            If you believe this is an error, please check the URL or contact support.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/">
            <Button
              variant="outline"
              data-testid="not-found-home-button">
              Return Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
