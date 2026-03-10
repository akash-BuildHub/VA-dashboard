import axios from 'axios';
// cspell:ignore owlytics Aarav Sharma Riya Mehta Karan Neha Verma Isha Nair Rohan Priya Vikram Meera Joshi Aditya Nikhil Sana

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

const defaultCameras = [
  { id: 'entrance', name: 'Entrance' },
  { id: 'workspace', name: 'Workspace' },
  { id: 'owlytics', name: 'Owlytics' },
];

const toDateOptions = (days = 7) => {
  const options = [];
  for (let i = 0; i < days; i += 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const value = date.toISOString().split('T')[0];
    options.push({
      value,
      label: date.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }),
    });
  }
  return options;
};

const mockPersonsByCamera = {
  entrance: ['Aarav Sharma', 'Riya Mehta', 'Karan Patel', 'Neha Verma'],
  workspace: ['Isha Nair', 'Rohan Singh', 'Priya Das', 'Vikram Rao'],
  owlytics: ['Meera Joshi', 'Aditya Jain', 'Nikhil Roy', 'Sana Khan'],
};

const buildMockOverview = ({ camera, date }) => {
  const names = mockPersonsByCamera[camera] || mockPersonsByCamera.workspace;
  const daySeed = new Date(date).getDate() % 2;
  const slotSets = daySeed
    ? [
        ['00:00', '01:10'],
        ['01:10', '02:35'],
        ['02:35', '03:50'],
        ['03:50', '05:00'],
      ]
    : [
        ['00:00', '01:20'],
        ['01:20', '02:45'],
        ['02:45', '03:55'],
        ['03:55', '05:00'],
      ];

  const persons = names.map((name, idx) => ({
    id: `p-${camera}-${idx + 1}`,
    name,
    startTime: slotSets[idx][0],
    endTime: slotSets[idx][1],
  }));

  const videoStartTime = `${date}T09:00:00`;
  const videoEndTime = new Date(new Date(videoStartTime).getTime() + 300 * 1000).toISOString();

  return {
    cameraId: camera,
    cameraName: defaultCameras.find((item) => item.id === camera)?.name || 'Workspace',
    timestamp: Date.now(),
    videoStartTime,
    videoEndTime,
    personsDetected: Math.max(0, persons.length + ((new Date(date).getDate() % 3) - 1)),
    persons,
  };
};

const buildMockTimeline = ({ personName }) => {
  const timelines = {
    'Aarav Sharma': [
      { start: 0, end: 75, label: 'Working', key: 'working' },
      { start: 75, end: 125, label: 'Employee using mobile phone', key: 'mobile' },
      { start: 125, end: 180, label: 'Working', key: 'working' },
      { start: 180, end: 220, label: 'Sleeping', key: 'sleeping' },
      { start: 220, end: 255, label: 'Not in workplace', key: 'absent' },
      { start: 255, end: 300, label: 'Working', key: 'working' },
    ],
    'Riya Mehta': [
      { start: 0, end: 60, label: 'Working', key: 'working' },
      { start: 60, end: 130, label: 'Not in workplace', key: 'absent' },
      { start: 130, end: 180, label: 'Working', key: 'working' },
      { start: 180, end: 225, label: 'Employee using mobile phone', key: 'mobile' },
      { start: 225, end: 300, label: 'Working', key: 'working' },
    ],
    'Karan Patel': [
      { start: 0, end: 95, label: 'Working', key: 'working' },
      { start: 95, end: 175, label: 'Sleeping', key: 'sleeping' },
      { start: 175, end: 240, label: 'Working', key: 'working' },
      { start: 240, end: 300, label: 'Employee using mobile phone', key: 'mobile' },
    ],
    'Neha Verma': [
      { start: 0, end: 105, label: 'Working', key: 'working' },
      { start: 105, end: 155, label: 'Employee using mobile phone', key: 'mobile' },
      { start: 155, end: 220, label: 'Working', key: 'working' },
      { start: 220, end: 300, label: 'Not in workplace', key: 'absent' },
    ],
  };

  return {
    durationSeconds: 300,
    timeline: timelines[personName] || timelines['Aarav Sharma'],
  };
};

// GET /api/dashboard/filters -> { cameras: [{id,name}], dates: [{value,label}] }
export const fetchDashboardFilters = async () => {
  try {
    const response = await apiClient.get('/dashboard/filters');
    return response.data;
  } catch (error) {
    console.warn('Filters API unavailable, using fallback data.', error);
    return { cameras: defaultCameras, dates: toDateOptions(7) };
  }
};

// GET /api/dashboard/overview?camera=<id>&date=<yyyy-mm-dd>
// -> { cameraId, cameraName, timestamp, videoStartTime, videoEndTime, personsDetected, persons:[{id,name,startTime,endTime}] }
export const fetchDashboardOverview = async ({ camera, date }) => {
  try {
    const response = await apiClient.get('/dashboard/overview', {
      params: { camera, date },
    });
    return response.data;
  } catch (error) {
    console.warn('Overview API unavailable, using fallback data.', error);
    return buildMockOverview({ camera, date });
  }
};

// GET /api/dashboard/person-activity?camera=<id>&date=<yyyy-mm-dd>&personId=<id>
// -> { durationSeconds, timeline:[{start,end,label,key}] }
export const fetchPersonActivityTimeline = async ({ camera, date, personId, personName }) => {
  try {
    const response = await apiClient.get('/dashboard/person-activity', {
      params: { camera, date, personId },
    });
    return response.data;
  } catch (error) {
    console.warn('Person timeline API unavailable, using fallback data.', error);
    return buildMockTimeline({ personName });
  }
};
