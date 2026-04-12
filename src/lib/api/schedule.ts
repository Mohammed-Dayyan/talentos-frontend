export async function fetchSchedule(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schedule/${token}`);
  if (res.status === 404) throw new Error('NOT_FOUND');
  if (res.status === 410) throw new Error('EXPIRED');
  if (!res.ok) throw new Error('ERROR');
  return res.json();
}

export async function submitSlots(token: string, slots: Array<{start: string, end: string, preference_rank: number}>) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schedule/${token}/slots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slots }),
  });
  if (res.status === 409) throw new Error('ALREADY_SUBMITTED');
  if (!res.ok) throw new Error('ERROR');
  return res.json();
}
