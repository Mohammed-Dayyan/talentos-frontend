'use client';

import React, { useState, useEffect } from 'react';
import { fetchSchedule, submitSlots } from '@/lib/api/schedule';
import { Schedule } from '@/types';
import { Card, Button, Input, Label } from '@/components/ui';

interface Props {
  params: { token: string };
}

const SchedulePage = ({ params }: Props) => {
  const { token } = params;
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [slots, setSlots] = useState([{ start: '', end: '', preference_rank: 1 }]);

  useEffect(() => {
    async function getSchedule() {
      const data = await fetchSchedule(token);
      setSchedule(data);
    }
    getSchedule();
  }, [token]);

  const handleAddSlot = () => {
    if (slots.length < 5) setSlots([...slots, { start: '', end: '', preference_rank: slots.length + 1 }]);
  };

  const handleRemoveSlot = (index: number) => {
    const newSlots = slots.filter((_, i) => i !== index).map((slot, i) => ({ ...slot, preference_rank: i + 1 }));
    setSlots(newSlots);
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newSlots = slots.map((slot, i) => i === index ? { ...slot, [field]: value } : slot);
    setSlots(newSlots);
  };

  const handleSubmit = async () => {
    try {
      await submitSlots(token, slots);
      alert("Thanks! Your availability has been submitted. We'll confirm the interview time shortly.");
    } catch (error: unknown) {
      if (error instanceof Error)
      if (error.message === 'ALREADY_SUBMITTED') {
        alert("You've already submitted your availability for this interview.");
      } else {
        console.error(error);
        alert("An error occurred. Please try again later.");
      }
    }
  };

  if (!schedule) return <div>Loading...</div>;

  return (
    <Card>
      <h2>Schedule for {schedule.candidate.name}</h2>
      <p>Role: {schedule.role.title}</p>
      <p>Round: {schedule.round.round_label}</p>
      <p>Duration: {schedule.round.duration_minutes} min</p>
      <p>Interviewer: {schedule.interviewer.email}</p>
      <p>Expires on: {new Date(schedule.expires_at).toLocaleString()}</p>

      <h3>Your Availability</h3>
      {slots.map((slot, index) => (
        <div key={index}>
          <Label>Start time</Label>
          <Input
            type="datetime-local"
            value={slot.start}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(index, 'start', e.target.value)}
          />
          <Label>End time</Label>
          <Input
            type="datetime-local"
            value={slot.end}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(index, 'end', e.target.value)}
          />
          <Button onClick={() => handleRemoveSlot(index)}>Remove</Button>
        </div>
      ))}
      <Button onClick={handleAddSlot}>Add another slot</Button>
      <Button onClick={handleSubmit}>Submit</Button>
    </Card>
  );
};

export default SchedulePage;
