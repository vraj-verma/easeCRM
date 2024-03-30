enum Role {
     OWNER = 'Owner',
     ADMIN = 'Admin',
     VIEWER = 'Viewer'
}

enum Status {
     ACTIVE = 'Active',
     DEACTIVE = 'Deactive'
}

enum Plan {
     FREE = 'Free',
     BASIC = 'Basic',
     PRO = 'Pro'
}

enum CRM_STATUS {
     hot = 'Hot',
     cold = 'Cold',
     warm = 'Warm',
}

enum Deal {
     done = 'Done',
     progress = 'Progress',
     rejected = 'Rejected',
}

export {
     Role,
     Status,
     Plan,
     CRM_STATUS,
     Deal
}

