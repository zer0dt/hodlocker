import { postNewBitcoiner } from "@/app/server-actions";
import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";

export const authOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
      version: "2.0",
      profile(profile) {
        console.log(profile)

        if (profile && profile.data.id && profile.data.username && profile.data.profile_image_url) {
          const saveProfile = async () => {

            const normal_avatar = profile.data.profile_image_url
            const largerUrl = normal_avatar.replace("_normal", "");

            const bitcoiner = await postNewBitcoiner(profile.data.username, profile.data.id, profile.data.id, largerUrl)
          }
          saveProfile()
        }
        return {
          id: profile.data.id, // assuming the Twitter profile ID is in 'id_str' field
          username: profile.data.username,
          image: profile.data.profile_image_url, // URL of the profile image
          // Add other fields you need from the Twitter profile
        };
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
  },
};

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }