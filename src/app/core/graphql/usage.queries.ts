import { gql } from 'apollo-angular';

export const APP_USAGE_SESSIONS = gql`
query AppUsageSessions($filter: AppUsageSessionFilter) {
  appUsageSessions(filter: $filter) {
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
query AppUsageSummary($filter: AppUsageSessionFilter) {
  appUsageSummary(filter: $filter) {
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

export const DEVICE_USAGE_SUMMARY = gql`
query DeviceUsageSummary($filter: DeviceFilter, $startedAfter: DateTimeISO, $startedBefore: DateTimeISO) {
  deviceUsageSummary(filter: $filter, startedAfter: $startedAfter, startedBefore: $startedBefore) {
    deviceId
    serialNumber
    stationCode
    osType
    osVersion
    sessionCount
    totalForegroundSeconds
    lastSeen
  }
}
`;

export const USER_USAGE_SUMMARY = gql`
query UserUsageSummary($filter: AppUsageSessionFilter) {
  userUsageSummary(filter: $filter) {
    employeeId
    employeeName
    appNames
    appIds
    stationCodes
    sessionCount
    totalForegroundSeconds
    lastSeen
  }
}
`;