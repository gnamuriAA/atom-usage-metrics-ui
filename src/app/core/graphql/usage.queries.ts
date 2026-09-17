import { gql } from 'apollo-angular';

export const APP_USAGE_SESSIONS = gql`
query AppUsageSessions {
  appUsageSessions {
    _id
    sessionId
    appName
    appId
    appVersion
    deviceId
    employeeId
    employeeName
    deviceSerial
    deviceStationCode
    foregroundDurationSeconds
    sessionStartTime
    sessionEndTime
    events {
      eventType
      eventId
      foregroundTimestamp
      backgroundTimestamp
      screen
      crashReason
      crashCallStack
      networkType
      timestamp
    }
    createdAt
    createdBy
    updatedAt
    updatedBy
    version
  }
}
`;

export const APP_USAGE_SUMMARY = gql`
query AppUsageSummary {
  appUsageSummary {
    appName
    appId
    totalForegroundSeconds
    averageSessionSeconds
    sessionCount
    crashCount
    forceCloseCount
    uniqueUserCount
  }
}
`;