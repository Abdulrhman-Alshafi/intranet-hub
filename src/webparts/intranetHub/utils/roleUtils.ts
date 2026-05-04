import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/site-groups';
import '@pnp/sp/site-users/web';

export enum UserRole {
  User = 'user',
  Admin = 'admin',
  MainAdmin = 'mainAdmin',
}

export async function detectUserRole(sp: SPFI): Promise<UserRole> {
  try {
    const currentUser = await sp.web.currentUser();
    // Check if user is a site admin (Site Collection Administrator)
    if (currentUser.IsSiteAdmin) {
      return UserRole.MainAdmin;
    }

    // Check if user is in the associated owner group (Site Owners)
    try {
      const ownerGroup = await sp.web.associatedOwnerGroup();
      const owners = await sp.web.siteGroups.getById(ownerGroup.Id).users();
      const isOwner = owners.some(
        (u: { LoginName: string }) => u.LoginName === currentUser.LoginName
      );
      if (isOwner) {
        return UserRole.Admin;
      }
    } catch {
      // Group check failed, user is not an owner
    }

    return UserRole.User;
  } catch {
    return UserRole.User;
  }
}
