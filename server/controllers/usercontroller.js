import userModel from "../Models/userModel.js";

export const getUserData = async (req, res) =>{
    const { userId } = req.body;

    if (!userId) {
        return res.json({ success: false, message: "User ID is required" });
    }

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({
            success: true,
            userData: {
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }
        });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
}