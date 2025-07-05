
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';

interface DashboardCalendarProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}

const DashboardCalendar: React.FC<DashboardCalendarProps> = ({ date, onSelect }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Calendar</CardTitle>
        <CardDescription>Schedule and deadlines</CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          className="rounded-md border"
        />
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full text-eduBlue-500" 
          onClick={() => window.open('https://calendar.google.com', '_blank')}
        >
          <CalendarIcon className="mr-2 h-4 w-4" /> Open Google Calendar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DashboardCalendar;
