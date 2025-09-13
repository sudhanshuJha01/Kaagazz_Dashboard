import { useEffect, useState, useCallback } from 'react';
import { getAdminUsers, sendMassEmail } from '../services/api';
import type { User } from '../types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ChevronsRight, Mail, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const Customers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserEmails, setSelectedUserEmails] = useState<string[]>([]);
    const [sortOption, setSortOption] = useState('newest');
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAdminUsers(sortOption);
            setUsers(data.users || []);
        } catch (err) {
            toast.error("Failed to fetch customers.");
        } finally {
            setLoading(false);
        }
    }, [sortOption]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked) {
            setSelectedUserEmails(users.map(u => u.email).filter((e): e is string => !!e));
        } else {
            setSelectedUserEmails([]);
        }
    };

    const handleSelectOne = (email: string, checked: boolean) => {
        if (checked) {
            setSelectedUserEmails(prev => [...prev, email]);
        } else {
            setSelectedUserEmails(prev => prev.filter(e => e !== email));
        }
    };

    const handleSendEmail = async () => {
        if (selectedUserEmails.length === 0) return toast.error("No users selected.");
        if (!emailSubject || !emailBody) return toast.error("Subject and body are required.");
        try {
            await sendMassEmail(selectedUserEmails, emailSubject, emailBody);
            toast.success("Email sent successfully!");
            setIsEmailDialogOpen(false);
            setSelectedUserEmails([]);
            setEmailSubject('');
            setEmailBody('');
        } catch (error) {
            toast.error("Failed to send email.");
        }
    };

    return (
        <div className="space-y-6">
            <Card className="bg-white/80 border-none shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold text-[#5C4033] font-serif">Customer Relationship</CardTitle>
                        <CardDescription>View, analyze, and communicate with your customers.</CardDescription>
                    </div>
                    <div className="flex gap-4">
                        {selectedUserEmails.length > 0 && (
                            <Button variant="outline" onClick={() => setIsEmailDialogOpen(true)}>
                                <Mail className="mr-2 h-4 w-4" /> Send Email ({selectedUserEmails.length})
                            </Button>
                        )}
                        <Select value={sortOption} onValueChange={setSortOption}>
                            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by..." /></SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="newest">Most Recent</SelectItem>
                                <SelectItem value="most_valuable">Most Valuable</SelectItem>
                                <SelectItem value="most_orders">Most Orders</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox onCheckedChange={handleSelectAll} checked={users.length > 0 && selectedUserEmails.length === users.length}/>
                                </TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Total Orders</TableHead>
                                <TableHead>Total Spent</TableHead>
                                <TableHead className="text-right">View</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-[#5C4033]">
                                        Loading customers...
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                                        No customers found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map(user => (
                                    <TableRow key={user._id}>
                                        <TableCell>
                                            <Checkbox onCheckedChange={(checked) => handleSelectOne(user.email!, !!checked)} checked={selectedUserEmails.includes(user.email!)} />
                                        </TableCell>
                                        <TableCell className="font-medium">{user.fullname}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.totalOrders}</TableCell>
                                        <TableCell className="font-semibold text-green-600">₹{user.totalSpent.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => navigate(`/customers/${user._id}`)}>
                                                <ChevronsRight className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Mass Email Modal */}
            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>Send Email to {selectedUserEmails.length} Customers</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input placeholder="Subject" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} />
                        <textarea placeholder="Email body... (HTML is supported)" value={emailBody} onChange={e => setEmailBody(e.target.value)} className="w-full h-40 p-2 border rounded-md" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSendEmail} className="bg-[#5d4037] hover:bg-[#3e2f22]"><Send className="mr-2 h-4 w-4"/> Send</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
export default Customers;