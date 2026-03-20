import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model SeasonUser
 *
 */
export type SeasonUserModel = runtime.Types.Result.DefaultSelection<Prisma.$SeasonUserPayload>;
export type AggregateSeasonUser = {
    _count: SeasonUserCountAggregateOutputType | null;
    _avg: SeasonUserAvgAggregateOutputType | null;
    _sum: SeasonUserSumAggregateOutputType | null;
    _min: SeasonUserMinAggregateOutputType | null;
    _max: SeasonUserMaxAggregateOutputType | null;
};
export type SeasonUserAvgAggregateOutputType = {
    seasonId: number | null;
    userId: number | null;
    finalRank: number | null;
    totalPoints: number | null;
};
export type SeasonUserSumAggregateOutputType = {
    seasonId: number | null;
    userId: number | null;
    finalRank: number | null;
    totalPoints: number | null;
};
export type SeasonUserMinAggregateOutputType = {
    id: string | null;
    seasonId: number | null;
    userId: number | null;
    teamName: string | null;
    finalRank: number | null;
    totalPoints: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type SeasonUserMaxAggregateOutputType = {
    id: string | null;
    seasonId: number | null;
    userId: number | null;
    teamName: string | null;
    finalRank: number | null;
    totalPoints: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type SeasonUserCountAggregateOutputType = {
    id: number;
    seasonId: number;
    userId: number;
    teamName: number;
    finalRank: number;
    totalPoints: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type SeasonUserAvgAggregateInputType = {
    seasonId?: true;
    userId?: true;
    finalRank?: true;
    totalPoints?: true;
};
export type SeasonUserSumAggregateInputType = {
    seasonId?: true;
    userId?: true;
    finalRank?: true;
    totalPoints?: true;
};
export type SeasonUserMinAggregateInputType = {
    id?: true;
    seasonId?: true;
    userId?: true;
    teamName?: true;
    finalRank?: true;
    totalPoints?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type SeasonUserMaxAggregateInputType = {
    id?: true;
    seasonId?: true;
    userId?: true;
    teamName?: true;
    finalRank?: true;
    totalPoints?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type SeasonUserCountAggregateInputType = {
    id?: true;
    seasonId?: true;
    userId?: true;
    teamName?: true;
    finalRank?: true;
    totalPoints?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type SeasonUserAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which SeasonUser to aggregate.
     */
    where?: Prisma.SeasonUserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of SeasonUsers to fetch.
     */
    orderBy?: Prisma.SeasonUserOrderByWithRelationInput | Prisma.SeasonUserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.SeasonUserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` SeasonUsers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` SeasonUsers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned SeasonUsers
    **/
    _count?: true | SeasonUserCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: SeasonUserAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: SeasonUserSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: SeasonUserMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: SeasonUserMaxAggregateInputType;
};
export type GetSeasonUserAggregateType<T extends SeasonUserAggregateArgs> = {
    [P in keyof T & keyof AggregateSeasonUser]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateSeasonUser[P]> : Prisma.GetScalarType<T[P], AggregateSeasonUser[P]>;
};
export type SeasonUserGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SeasonUserWhereInput;
    orderBy?: Prisma.SeasonUserOrderByWithAggregationInput | Prisma.SeasonUserOrderByWithAggregationInput[];
    by: Prisma.SeasonUserScalarFieldEnum[] | Prisma.SeasonUserScalarFieldEnum;
    having?: Prisma.SeasonUserScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SeasonUserCountAggregateInputType | true;
    _avg?: SeasonUserAvgAggregateInputType;
    _sum?: SeasonUserSumAggregateInputType;
    _min?: SeasonUserMinAggregateInputType;
    _max?: SeasonUserMaxAggregateInputType;
};
export type SeasonUserGroupByOutputType = {
    id: string;
    seasonId: number;
    userId: number;
    teamName: string;
    finalRank: number | null;
    totalPoints: number;
    createdAt: Date;
    updatedAt: Date;
    _count: SeasonUserCountAggregateOutputType | null;
    _avg: SeasonUserAvgAggregateOutputType | null;
    _sum: SeasonUserSumAggregateOutputType | null;
    _min: SeasonUserMinAggregateOutputType | null;
    _max: SeasonUserMaxAggregateOutputType | null;
};
type GetSeasonUserGroupByPayload<T extends SeasonUserGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<SeasonUserGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof SeasonUserGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], SeasonUserGroupByOutputType[P]> : Prisma.GetScalarType<T[P], SeasonUserGroupByOutputType[P]>;
}>>;
export type SeasonUserWhereInput = {
    AND?: Prisma.SeasonUserWhereInput | Prisma.SeasonUserWhereInput[];
    OR?: Prisma.SeasonUserWhereInput[];
    NOT?: Prisma.SeasonUserWhereInput | Prisma.SeasonUserWhereInput[];
    id?: Prisma.StringFilter<"SeasonUser"> | string;
    seasonId?: Prisma.IntFilter<"SeasonUser"> | number;
    userId?: Prisma.IntFilter<"SeasonUser"> | number;
    teamName?: Prisma.StringFilter<"SeasonUser"> | string;
    finalRank?: Prisma.IntNullableFilter<"SeasonUser"> | number | null;
    totalPoints?: Prisma.IntFilter<"SeasonUser"> | number;
    createdAt?: Prisma.DateTimeFilter<"SeasonUser"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"SeasonUser"> | Date | string;
    season?: Prisma.XOR<Prisma.SeasonScalarRelationFilter, Prisma.SeasonWhereInput>;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    scores?: Prisma.ScoreListRelationFilter;
    chipPlays?: Prisma.ChipPlayListRelationFilter;
    playerPicks?: Prisma.PlayerPickListRelationFilter;
};
export type SeasonUserOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    seasonId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    teamName?: Prisma.SortOrder;
    finalRank?: Prisma.SortOrderInput | Prisma.SortOrder;
    totalPoints?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    season?: Prisma.SeasonOrderByWithRelationInput;
    user?: Prisma.UserOrderByWithRelationInput;
    scores?: Prisma.ScoreOrderByRelationAggregateInput;
    chipPlays?: Prisma.ChipPlayOrderByRelationAggregateInput;
    playerPicks?: Prisma.PlayerPickOrderByRelationAggregateInput;
};
export type SeasonUserWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    seasonId_userId?: Prisma.SeasonUserSeasonIdUserIdCompoundUniqueInput;
    AND?: Prisma.SeasonUserWhereInput | Prisma.SeasonUserWhereInput[];
    OR?: Prisma.SeasonUserWhereInput[];
    NOT?: Prisma.SeasonUserWhereInput | Prisma.SeasonUserWhereInput[];
    seasonId?: Prisma.IntFilter<"SeasonUser"> | number;
    userId?: Prisma.IntFilter<"SeasonUser"> | number;
    teamName?: Prisma.StringFilter<"SeasonUser"> | string;
    finalRank?: Prisma.IntNullableFilter<"SeasonUser"> | number | null;
    totalPoints?: Prisma.IntFilter<"SeasonUser"> | number;
    createdAt?: Prisma.DateTimeFilter<"SeasonUser"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"SeasonUser"> | Date | string;
    season?: Prisma.XOR<Prisma.SeasonScalarRelationFilter, Prisma.SeasonWhereInput>;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    scores?: Prisma.ScoreListRelationFilter;
    chipPlays?: Prisma.ChipPlayListRelationFilter;
    playerPicks?: Prisma.PlayerPickListRelationFilter;
}, "id" | "seasonId_userId">;
export type SeasonUserOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    seasonId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    teamName?: Prisma.SortOrder;
    finalRank?: Prisma.SortOrderInput | Prisma.SortOrder;
    totalPoints?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.SeasonUserCountOrderByAggregateInput;
    _avg?: Prisma.SeasonUserAvgOrderByAggregateInput;
    _max?: Prisma.SeasonUserMaxOrderByAggregateInput;
    _min?: Prisma.SeasonUserMinOrderByAggregateInput;
    _sum?: Prisma.SeasonUserSumOrderByAggregateInput;
};
export type SeasonUserScalarWhereWithAggregatesInput = {
    AND?: Prisma.SeasonUserScalarWhereWithAggregatesInput | Prisma.SeasonUserScalarWhereWithAggregatesInput[];
    OR?: Prisma.SeasonUserScalarWhereWithAggregatesInput[];
    NOT?: Prisma.SeasonUserScalarWhereWithAggregatesInput | Prisma.SeasonUserScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"SeasonUser"> | string;
    seasonId?: Prisma.IntWithAggregatesFilter<"SeasonUser"> | number;
    userId?: Prisma.IntWithAggregatesFilter<"SeasonUser"> | number;
    teamName?: Prisma.StringWithAggregatesFilter<"SeasonUser"> | string;
    finalRank?: Prisma.IntNullableWithAggregatesFilter<"SeasonUser"> | number | null;
    totalPoints?: Prisma.IntWithAggregatesFilter<"SeasonUser"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"SeasonUser"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"SeasonUser"> | Date | string;
};
export type SeasonUserCreateInput = {
    id?: string;
    teamName: string;
    finalRank?: number | null;
    totalPoints?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    season: Prisma.SeasonCreateNestedOneWithoutSeasonUsersInput;
    user: Prisma.UserCreateNestedOneWithoutSeasonsPlayedInput;
    scores?: Prisma.ScoreCreateNestedManyWithoutSeasonUserInput;
    chipPlays?: Prisma.ChipPlayCreateNestedManyWithoutSeasonUserInput;
    playerPicks?: Prisma.PlayerPickCreateNestedManyWithoutSeasonUserInput;
};
export type SeasonUserUncheckedCreateInput = {
    id?: string;
    seasonId: number;
    userId: number;
    teamName: string;
    finalRank?: number | null;
    totalPoints?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    scores?: Prisma.ScoreUncheckedCreateNestedManyWithoutSeasonUserInput;
    chipPlays?: Prisma.ChipPlayUncheckedCreateNestedManyWithoutSeasonUserInput;
    playerPicks?: Prisma.PlayerPickUncheckedCreateNestedManyWithoutSeasonUserInput;
};
export type SeasonUserUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    teamName?: Prisma.StringFieldUpdateOperationsInput | string;
    finalRank?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    season?: Prisma.SeasonUpdateOneRequiredWithoutSeasonUsersNestedInput;
    user?: Prisma.UserUpdateOneRequiredWithoutSeasonsPlayedNestedInput;
    scores?: Prisma.ScoreUpdateManyWithoutSeasonUserNestedInput;
    chipPlays?: Prisma.ChipPlayUpdateManyWithoutSeasonUserNestedInput;
    playerPicks?: Prisma.PlayerPickUpdateManyWithoutSeasonUserNestedInput;
};
export type SeasonUserUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    seasonId?: Prisma.IntFieldUpdateOperationsInput | number;
    userId?: Prisma.IntFieldUpdateOperationsInput | number;
    teamName?: Prisma.StringFieldUpdateOperationsInput | string;
    finalRank?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scores?: Prisma.ScoreUncheckedUpdateManyWithoutSeasonUserNestedInput;
    chipPlays?: Prisma.ChipPlayUncheckedUpdateManyWithoutSeasonUserNestedInput;
    playerPicks?: Prisma.PlayerPickUncheckedUpdateManyWithoutSeasonUserNestedInput;
};
export type SeasonUserCreateManyInput = {
    id?: string;
    seasonId: number;
    userId: number;
    teamName: string;
    finalRank?: number | null;
    totalPoints?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type SeasonUserUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    teamName?: Prisma.StringFieldUpdateOperationsInput | string;
    finalRank?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SeasonUserUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    seasonId?: Prisma.IntFieldUpdateOperationsInput | number;
    userId?: Prisma.IntFieldUpdateOperationsInput | number;
    teamName?: Prisma.StringFieldUpdateOperationsInput | string;
    finalRank?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SeasonUserListRelationFilter = {
    every?: Prisma.SeasonUserWhereInput;
    some?: Prisma.SeasonUserWhereInput;
    none?: Prisma.SeasonUserWhereInput;
};
export type SeasonUserOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type SeasonUserSeasonIdUserIdCompoundUniqueInput = {
    seasonId: number;
    userId: number;
};
export type SeasonUserCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    seasonId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    teamName?: Prisma.SortOrder;
    finalRank?: Prisma.SortOrder;
    totalPoints?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SeasonUserAvgOrderByAggregateInput = {
    seasonId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    finalRank?: Prisma.SortOrder;
    totalPoints?: Prisma.SortOrder;
};
export type SeasonUserMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    seasonId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    teamName?: Prisma.SortOrder;
    finalRank?: Prisma.SortOrder;
    totalPoints?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SeasonUserMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    seasonId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    teamName?: Prisma.SortOrder;
    finalRank?: Prisma.SortOrder;
    totalPoints?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SeasonUserSumOrderByAggregateInput = {
    seasonId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    finalRank?: Prisma.SortOrder;
    totalPoints?: Prisma.SortOrder;
};
export type SeasonUserScalarRelationFilter = {
    is?: Prisma.SeasonUserWhereInput;
    isNot?: Prisma.SeasonUserWhereInput;
};
export type SeasonUserCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.SeasonUserCreateWithoutUserInput, Prisma.SeasonUserUncheckedCreateWithoutUserInput> | Prisma.SeasonUserCreateWithoutUserInput[] | Prisma.SeasonUserUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.SeasonUserCreateOrConnectWithoutUserInput | Prisma.SeasonUserCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.SeasonUserCreateManyUserInputEnvelope;
    connect?: Prisma.SeasonUserWhereUniqueInput | Prisma.SeasonUserWhereUniqueInput[];
};
export type SeasonUserUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.SeasonUserCreateWithoutUserInput, Prisma.SeasonUserUncheckedCreateWithoutUserInput> | Prisma.SeasonUserCreateWithoutUserInput[] | Prisma.SeasonUserUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.SeasonUserCreateOrConnectWithoutUserInput | Prisma.SeasonUserCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.SeasonUserCreateManyUserInputEnvelope;
    connect?: Prisma.SeasonUserWhereUniqueInput | Prisma.SeasonUserWhereUniqueInput[];
};
export type SeasonUserUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.SeasonUserCreateWithoutUserInput, Prisma.SeasonUserUncheckedCreateWithoutUserInput> | Prisma.SeasonUserCreateWithoutUserInput[] | Prisma.SeasonUserUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.SeasonUserCreateOrConnectWithoutUserInput | Prisma.SeasonUserCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.SeasonUserUpsertWithWhereUniqueWithoutUserInput | Prisma.SeasonUserUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.SeasonUserCreateManyUserInputEnvelope;
    set?: Prisma.SeasonUserWhereUniqueInput | Prisma.SeasonUserWhereUniqueInput[];
    disconnect?: Prisma.SeasonUserWhereUniqueInput | Prisma.SeasonUserWhereUniqueInput[];
    delete?: Prisma.SeasonUserWhereUniqueInput | Prisma.SeasonUserWhereUniqueInput[];
    connect?: Prisma.SeasonUserWhereUniqueInput | Prisma.SeasonUserWhereUniqueInput[];
    update?: Prisma.SeasonUserUpdateWithWhereUniqueWithoutUserInput | Prisma.SeasonUserUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.SeasonUserUpdateManyWithWhereWithoutUserInput | Prisma.SeasonUserUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.SeasonUserScalarWhereInput | Prisma.SeasonUserScalarWhereInput[];
};
export type SeasonUserUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.SeasonUserCreateWithoutUserInput, Prisma.SeasonUserUncheckedCreateWithoutUserInput> | Prisma.SeasonUserCreateWithoutUserInput[] | Prisma.SeasonUserUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.SeasonUserCreateOrConnectWithoutUserInput | Prisma.SeasonUserCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.SeasonUserUpsertWithWhereUniqueWithoutUserInput | Prisma.SeasonUserUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.SeasonUserCreateManyUserInputEnvelope;
    set?: Prisma.SeasonUserWhereUniqueInput | Prisma.SeasonUserWhereUniqueInput[];
    disconnect?: Prisma.SeasonUserWhereUniqueInput | Prisma.SeasonUserWhereUniqueInput[];
    delete?: Prisma.SeasonUserWhereUniqueInput | Prisma.SeasonUserWhereUniqueInput[];
    connect?: Prisma.SeasonUserWhereUniqueInput | Prisma.SeasonUserWhereUniqueInput[];
    update?: Prisma.SeasonUserUpdateWithWhereUniqueWithoutUserInput | Prisma.SeasonUserUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.SeasonUserUpdateManyWithWhereWithoutUserInput | Prisma.SeasonUserUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.SeasonUserScalarWhereInput | Prisma.SeasonUserScalarWhereInput[];
};
export type SeasonUserCreateNestedManyWithoutSeasonInput = {
    create?: Prisma.XOR<Prisma.SeasonUserCreateWithoutSeasonInput, Prisma.SeasonUserUncheckedCreateWithoutSeasonInput> | Prisma.SeasonUserCreateWithoutSeasonInput[] | Prisma.SeasonUserUncheckedCreateWithoutSeasonInput[];
    connectOrCreate?: Prisma.SeasonUserCreateOrConnectWithoutSeasonInput | Prisma.SeasonUserCreateOrConnectWithoutSeasonInput[];
    createMany?: Prisma.SeasonUserCreateManySeasonInputEnvelope;
    connect?: Prisma.SeasonUserWhereUniqueInput | Prisma.SeasonUserWhereUniqueInput[];
};
export type SeasonUserUncheckedCreateNestedManyWithoutSeasonInput = {
    create?: Prisma.XOR<Prisma.SeasonUserCreateWithoutSeasonInput, Prisma.SeasonUserUncheckedCreateWithoutSeasonInput> | Prisma.SeasonUserCreateWithoutSeasonInput[] | Prisma.SeasonUserUncheckedCreateWithoutSeasonInput[];
    connectOrCreate?: Prisma.SeasonUserCreateOrConnectWithoutSeasonInput | Prisma.SeasonUserCreateOrConnectWithoutSeasonInput[];
    createMany?: Prisma.SeasonUserCreateManySeasonInputEnvelope;
    connect?: Prisma.SeasonUserWhereUniqueInput | Prisma.SeasonUserWhereUniqueInput[];
};
export type SeasonUserUpdateManyWithoutSeasonNestedInput = {
    create?: Prisma.XOR<Prisma.SeasonUserCreateWithoutSeasonInput, Prisma.SeasonUserUncheckedCreateWithoutSeasonInput> | Prisma.SeasonUserCreateWithoutSeasonInput[] | Prisma.SeasonUserUncheckedCreateWithoutSeasonInput[];
    connectOrCreate?: Prisma.SeasonUserCreateOrConnectWithoutSeasonInput | Prisma.SeasonUserCreateOrConnectWithoutSeasonInput[];
    upsert?: Prisma.SeasonUserUpsertWithWhereUniqueWithoutSeasonInput | Prisma.SeasonUserUpsertWithWhereUniqueWithoutSeasonInput[];
    createMany?: Prisma.SeasonUserCreateManySeasonInputEnvelope;
    set?: Prisma.SeasonUserWhereUniqueInput | Prisma.SeasonUserWhereUniqueInput[];
    disconnect?: Prisma.SeasonUserWhereUniqueInput | Prisma.SeasonUserWhereUniqueInput[];
    delete?: Prisma.SeasonUserWhereUniqueInput | Prisma.SeasonUserWhereUniqueInput[];
    connect?: Prisma.SeasonUserWhereUniqueInput | Prisma.SeasonUserWhereUniqueInput[];
    update?: Prisma.SeasonUserUpdateWithWhereUniqueWithoutSeasonInput | Prisma.SeasonUserUpdateWithWhereUniqueWithoutSeasonInput[];
    updateMany?: Prisma.SeasonUserUpdateManyWithWhereWithoutSeasonInput | Prisma.SeasonUserUpdateManyWithWhereWithoutSeasonInput[];
    deleteMany?: Prisma.SeasonUserScalarWhereInput | Prisma.SeasonUserScalarWhereInput[];
};
export type SeasonUserUncheckedUpdateManyWithoutSeasonNestedInput = {
    create?: Prisma.XOR<Prisma.SeasonUserCreateWithoutSeasonInput, Prisma.SeasonUserUncheckedCreateWithoutSeasonInput> | Prisma.SeasonUserCreateWithoutSeasonInput[] | Prisma.SeasonUserUncheckedCreateWithoutSeasonInput[];
    connectOrCreate?: Prisma.SeasonUserCreateOrConnectWithoutSeasonInput | Prisma.SeasonUserCreateOrConnectWithoutSeasonInput[];
    upsert?: Prisma.SeasonUserUpsertWithWhereUniqueWithoutSeasonInput | Prisma.SeasonUserUpsertWithWhereUniqueWithoutSeasonInput[];
    createMany?: Prisma.SeasonUserCreateManySeasonInputEnvelope;
    set?: Prisma.SeasonUserWhereUniqueInput | Prisma.SeasonUserWhereUniqueInput[];
    disconnect?: Prisma.SeasonUserWhereUniqueInput | Prisma.SeasonUserWhereUniqueInput[];
    delete?: Prisma.SeasonUserWhereUniqueInput | Prisma.SeasonUserWhereUniqueInput[];
    connect?: Prisma.SeasonUserWhereUniqueInput | Prisma.SeasonUserWhereUniqueInput[];
    update?: Prisma.SeasonUserUpdateWithWhereUniqueWithoutSeasonInput | Prisma.SeasonUserUpdateWithWhereUniqueWithoutSeasonInput[];
    updateMany?: Prisma.SeasonUserUpdateManyWithWhereWithoutSeasonInput | Prisma.SeasonUserUpdateManyWithWhereWithoutSeasonInput[];
    deleteMany?: Prisma.SeasonUserScalarWhereInput | Prisma.SeasonUserScalarWhereInput[];
};
export type SeasonUserCreateNestedOneWithoutChipPlaysInput = {
    create?: Prisma.XOR<Prisma.SeasonUserCreateWithoutChipPlaysInput, Prisma.SeasonUserUncheckedCreateWithoutChipPlaysInput>;
    connectOrCreate?: Prisma.SeasonUserCreateOrConnectWithoutChipPlaysInput;
    connect?: Prisma.SeasonUserWhereUniqueInput;
};
export type SeasonUserUpdateOneRequiredWithoutChipPlaysNestedInput = {
    create?: Prisma.XOR<Prisma.SeasonUserCreateWithoutChipPlaysInput, Prisma.SeasonUserUncheckedCreateWithoutChipPlaysInput>;
    connectOrCreate?: Prisma.SeasonUserCreateOrConnectWithoutChipPlaysInput;
    upsert?: Prisma.SeasonUserUpsertWithoutChipPlaysInput;
    connect?: Prisma.SeasonUserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SeasonUserUpdateToOneWithWhereWithoutChipPlaysInput, Prisma.SeasonUserUpdateWithoutChipPlaysInput>, Prisma.SeasonUserUncheckedUpdateWithoutChipPlaysInput>;
};
export type SeasonUserCreateNestedOneWithoutScoresInput = {
    create?: Prisma.XOR<Prisma.SeasonUserCreateWithoutScoresInput, Prisma.SeasonUserUncheckedCreateWithoutScoresInput>;
    connectOrCreate?: Prisma.SeasonUserCreateOrConnectWithoutScoresInput;
    connect?: Prisma.SeasonUserWhereUniqueInput;
};
export type SeasonUserUpdateOneRequiredWithoutScoresNestedInput = {
    create?: Prisma.XOR<Prisma.SeasonUserCreateWithoutScoresInput, Prisma.SeasonUserUncheckedCreateWithoutScoresInput>;
    connectOrCreate?: Prisma.SeasonUserCreateOrConnectWithoutScoresInput;
    upsert?: Prisma.SeasonUserUpsertWithoutScoresInput;
    connect?: Prisma.SeasonUserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SeasonUserUpdateToOneWithWhereWithoutScoresInput, Prisma.SeasonUserUpdateWithoutScoresInput>, Prisma.SeasonUserUncheckedUpdateWithoutScoresInput>;
};
export type SeasonUserCreateNestedOneWithoutPlayerPicksInput = {
    create?: Prisma.XOR<Prisma.SeasonUserCreateWithoutPlayerPicksInput, Prisma.SeasonUserUncheckedCreateWithoutPlayerPicksInput>;
    connectOrCreate?: Prisma.SeasonUserCreateOrConnectWithoutPlayerPicksInput;
    connect?: Prisma.SeasonUserWhereUniqueInput;
};
export type SeasonUserUpdateOneRequiredWithoutPlayerPicksNestedInput = {
    create?: Prisma.XOR<Prisma.SeasonUserCreateWithoutPlayerPicksInput, Prisma.SeasonUserUncheckedCreateWithoutPlayerPicksInput>;
    connectOrCreate?: Prisma.SeasonUserCreateOrConnectWithoutPlayerPicksInput;
    upsert?: Prisma.SeasonUserUpsertWithoutPlayerPicksInput;
    connect?: Prisma.SeasonUserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SeasonUserUpdateToOneWithWhereWithoutPlayerPicksInput, Prisma.SeasonUserUpdateWithoutPlayerPicksInput>, Prisma.SeasonUserUncheckedUpdateWithoutPlayerPicksInput>;
};
export type SeasonUserCreateWithoutUserInput = {
    id?: string;
    teamName: string;
    finalRank?: number | null;
    totalPoints?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    season: Prisma.SeasonCreateNestedOneWithoutSeasonUsersInput;
    scores?: Prisma.ScoreCreateNestedManyWithoutSeasonUserInput;
    chipPlays?: Prisma.ChipPlayCreateNestedManyWithoutSeasonUserInput;
    playerPicks?: Prisma.PlayerPickCreateNestedManyWithoutSeasonUserInput;
};
export type SeasonUserUncheckedCreateWithoutUserInput = {
    id?: string;
    seasonId: number;
    teamName: string;
    finalRank?: number | null;
    totalPoints?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    scores?: Prisma.ScoreUncheckedCreateNestedManyWithoutSeasonUserInput;
    chipPlays?: Prisma.ChipPlayUncheckedCreateNestedManyWithoutSeasonUserInput;
    playerPicks?: Prisma.PlayerPickUncheckedCreateNestedManyWithoutSeasonUserInput;
};
export type SeasonUserCreateOrConnectWithoutUserInput = {
    where: Prisma.SeasonUserWhereUniqueInput;
    create: Prisma.XOR<Prisma.SeasonUserCreateWithoutUserInput, Prisma.SeasonUserUncheckedCreateWithoutUserInput>;
};
export type SeasonUserCreateManyUserInputEnvelope = {
    data: Prisma.SeasonUserCreateManyUserInput | Prisma.SeasonUserCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type SeasonUserUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.SeasonUserWhereUniqueInput;
    update: Prisma.XOR<Prisma.SeasonUserUpdateWithoutUserInput, Prisma.SeasonUserUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.SeasonUserCreateWithoutUserInput, Prisma.SeasonUserUncheckedCreateWithoutUserInput>;
};
export type SeasonUserUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.SeasonUserWhereUniqueInput;
    data: Prisma.XOR<Prisma.SeasonUserUpdateWithoutUserInput, Prisma.SeasonUserUncheckedUpdateWithoutUserInput>;
};
export type SeasonUserUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.SeasonUserScalarWhereInput;
    data: Prisma.XOR<Prisma.SeasonUserUpdateManyMutationInput, Prisma.SeasonUserUncheckedUpdateManyWithoutUserInput>;
};
export type SeasonUserScalarWhereInput = {
    AND?: Prisma.SeasonUserScalarWhereInput | Prisma.SeasonUserScalarWhereInput[];
    OR?: Prisma.SeasonUserScalarWhereInput[];
    NOT?: Prisma.SeasonUserScalarWhereInput | Prisma.SeasonUserScalarWhereInput[];
    id?: Prisma.StringFilter<"SeasonUser"> | string;
    seasonId?: Prisma.IntFilter<"SeasonUser"> | number;
    userId?: Prisma.IntFilter<"SeasonUser"> | number;
    teamName?: Prisma.StringFilter<"SeasonUser"> | string;
    finalRank?: Prisma.IntNullableFilter<"SeasonUser"> | number | null;
    totalPoints?: Prisma.IntFilter<"SeasonUser"> | number;
    createdAt?: Prisma.DateTimeFilter<"SeasonUser"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"SeasonUser"> | Date | string;
};
export type SeasonUserCreateWithoutSeasonInput = {
    id?: string;
    teamName: string;
    finalRank?: number | null;
    totalPoints?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutSeasonsPlayedInput;
    scores?: Prisma.ScoreCreateNestedManyWithoutSeasonUserInput;
    chipPlays?: Prisma.ChipPlayCreateNestedManyWithoutSeasonUserInput;
    playerPicks?: Prisma.PlayerPickCreateNestedManyWithoutSeasonUserInput;
};
export type SeasonUserUncheckedCreateWithoutSeasonInput = {
    id?: string;
    userId: number;
    teamName: string;
    finalRank?: number | null;
    totalPoints?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    scores?: Prisma.ScoreUncheckedCreateNestedManyWithoutSeasonUserInput;
    chipPlays?: Prisma.ChipPlayUncheckedCreateNestedManyWithoutSeasonUserInput;
    playerPicks?: Prisma.PlayerPickUncheckedCreateNestedManyWithoutSeasonUserInput;
};
export type SeasonUserCreateOrConnectWithoutSeasonInput = {
    where: Prisma.SeasonUserWhereUniqueInput;
    create: Prisma.XOR<Prisma.SeasonUserCreateWithoutSeasonInput, Prisma.SeasonUserUncheckedCreateWithoutSeasonInput>;
};
export type SeasonUserCreateManySeasonInputEnvelope = {
    data: Prisma.SeasonUserCreateManySeasonInput | Prisma.SeasonUserCreateManySeasonInput[];
    skipDuplicates?: boolean;
};
export type SeasonUserUpsertWithWhereUniqueWithoutSeasonInput = {
    where: Prisma.SeasonUserWhereUniqueInput;
    update: Prisma.XOR<Prisma.SeasonUserUpdateWithoutSeasonInput, Prisma.SeasonUserUncheckedUpdateWithoutSeasonInput>;
    create: Prisma.XOR<Prisma.SeasonUserCreateWithoutSeasonInput, Prisma.SeasonUserUncheckedCreateWithoutSeasonInput>;
};
export type SeasonUserUpdateWithWhereUniqueWithoutSeasonInput = {
    where: Prisma.SeasonUserWhereUniqueInput;
    data: Prisma.XOR<Prisma.SeasonUserUpdateWithoutSeasonInput, Prisma.SeasonUserUncheckedUpdateWithoutSeasonInput>;
};
export type SeasonUserUpdateManyWithWhereWithoutSeasonInput = {
    where: Prisma.SeasonUserScalarWhereInput;
    data: Prisma.XOR<Prisma.SeasonUserUpdateManyMutationInput, Prisma.SeasonUserUncheckedUpdateManyWithoutSeasonInput>;
};
export type SeasonUserCreateWithoutChipPlaysInput = {
    id?: string;
    teamName: string;
    finalRank?: number | null;
    totalPoints?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    season: Prisma.SeasonCreateNestedOneWithoutSeasonUsersInput;
    user: Prisma.UserCreateNestedOneWithoutSeasonsPlayedInput;
    scores?: Prisma.ScoreCreateNestedManyWithoutSeasonUserInput;
    playerPicks?: Prisma.PlayerPickCreateNestedManyWithoutSeasonUserInput;
};
export type SeasonUserUncheckedCreateWithoutChipPlaysInput = {
    id?: string;
    seasonId: number;
    userId: number;
    teamName: string;
    finalRank?: number | null;
    totalPoints?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    scores?: Prisma.ScoreUncheckedCreateNestedManyWithoutSeasonUserInput;
    playerPicks?: Prisma.PlayerPickUncheckedCreateNestedManyWithoutSeasonUserInput;
};
export type SeasonUserCreateOrConnectWithoutChipPlaysInput = {
    where: Prisma.SeasonUserWhereUniqueInput;
    create: Prisma.XOR<Prisma.SeasonUserCreateWithoutChipPlaysInput, Prisma.SeasonUserUncheckedCreateWithoutChipPlaysInput>;
};
export type SeasonUserUpsertWithoutChipPlaysInput = {
    update: Prisma.XOR<Prisma.SeasonUserUpdateWithoutChipPlaysInput, Prisma.SeasonUserUncheckedUpdateWithoutChipPlaysInput>;
    create: Prisma.XOR<Prisma.SeasonUserCreateWithoutChipPlaysInput, Prisma.SeasonUserUncheckedCreateWithoutChipPlaysInput>;
    where?: Prisma.SeasonUserWhereInput;
};
export type SeasonUserUpdateToOneWithWhereWithoutChipPlaysInput = {
    where?: Prisma.SeasonUserWhereInput;
    data: Prisma.XOR<Prisma.SeasonUserUpdateWithoutChipPlaysInput, Prisma.SeasonUserUncheckedUpdateWithoutChipPlaysInput>;
};
export type SeasonUserUpdateWithoutChipPlaysInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    teamName?: Prisma.StringFieldUpdateOperationsInput | string;
    finalRank?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    season?: Prisma.SeasonUpdateOneRequiredWithoutSeasonUsersNestedInput;
    user?: Prisma.UserUpdateOneRequiredWithoutSeasonsPlayedNestedInput;
    scores?: Prisma.ScoreUpdateManyWithoutSeasonUserNestedInput;
    playerPicks?: Prisma.PlayerPickUpdateManyWithoutSeasonUserNestedInput;
};
export type SeasonUserUncheckedUpdateWithoutChipPlaysInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    seasonId?: Prisma.IntFieldUpdateOperationsInput | number;
    userId?: Prisma.IntFieldUpdateOperationsInput | number;
    teamName?: Prisma.StringFieldUpdateOperationsInput | string;
    finalRank?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scores?: Prisma.ScoreUncheckedUpdateManyWithoutSeasonUserNestedInput;
    playerPicks?: Prisma.PlayerPickUncheckedUpdateManyWithoutSeasonUserNestedInput;
};
export type SeasonUserCreateWithoutScoresInput = {
    id?: string;
    teamName: string;
    finalRank?: number | null;
    totalPoints?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    season: Prisma.SeasonCreateNestedOneWithoutSeasonUsersInput;
    user: Prisma.UserCreateNestedOneWithoutSeasonsPlayedInput;
    chipPlays?: Prisma.ChipPlayCreateNestedManyWithoutSeasonUserInput;
    playerPicks?: Prisma.PlayerPickCreateNestedManyWithoutSeasonUserInput;
};
export type SeasonUserUncheckedCreateWithoutScoresInput = {
    id?: string;
    seasonId: number;
    userId: number;
    teamName: string;
    finalRank?: number | null;
    totalPoints?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    chipPlays?: Prisma.ChipPlayUncheckedCreateNestedManyWithoutSeasonUserInput;
    playerPicks?: Prisma.PlayerPickUncheckedCreateNestedManyWithoutSeasonUserInput;
};
export type SeasonUserCreateOrConnectWithoutScoresInput = {
    where: Prisma.SeasonUserWhereUniqueInput;
    create: Prisma.XOR<Prisma.SeasonUserCreateWithoutScoresInput, Prisma.SeasonUserUncheckedCreateWithoutScoresInput>;
};
export type SeasonUserUpsertWithoutScoresInput = {
    update: Prisma.XOR<Prisma.SeasonUserUpdateWithoutScoresInput, Prisma.SeasonUserUncheckedUpdateWithoutScoresInput>;
    create: Prisma.XOR<Prisma.SeasonUserCreateWithoutScoresInput, Prisma.SeasonUserUncheckedCreateWithoutScoresInput>;
    where?: Prisma.SeasonUserWhereInput;
};
export type SeasonUserUpdateToOneWithWhereWithoutScoresInput = {
    where?: Prisma.SeasonUserWhereInput;
    data: Prisma.XOR<Prisma.SeasonUserUpdateWithoutScoresInput, Prisma.SeasonUserUncheckedUpdateWithoutScoresInput>;
};
export type SeasonUserUpdateWithoutScoresInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    teamName?: Prisma.StringFieldUpdateOperationsInput | string;
    finalRank?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    season?: Prisma.SeasonUpdateOneRequiredWithoutSeasonUsersNestedInput;
    user?: Prisma.UserUpdateOneRequiredWithoutSeasonsPlayedNestedInput;
    chipPlays?: Prisma.ChipPlayUpdateManyWithoutSeasonUserNestedInput;
    playerPicks?: Prisma.PlayerPickUpdateManyWithoutSeasonUserNestedInput;
};
export type SeasonUserUncheckedUpdateWithoutScoresInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    seasonId?: Prisma.IntFieldUpdateOperationsInput | number;
    userId?: Prisma.IntFieldUpdateOperationsInput | number;
    teamName?: Prisma.StringFieldUpdateOperationsInput | string;
    finalRank?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    chipPlays?: Prisma.ChipPlayUncheckedUpdateManyWithoutSeasonUserNestedInput;
    playerPicks?: Prisma.PlayerPickUncheckedUpdateManyWithoutSeasonUserNestedInput;
};
export type SeasonUserCreateWithoutPlayerPicksInput = {
    id?: string;
    teamName: string;
    finalRank?: number | null;
    totalPoints?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    season: Prisma.SeasonCreateNestedOneWithoutSeasonUsersInput;
    user: Prisma.UserCreateNestedOneWithoutSeasonsPlayedInput;
    scores?: Prisma.ScoreCreateNestedManyWithoutSeasonUserInput;
    chipPlays?: Prisma.ChipPlayCreateNestedManyWithoutSeasonUserInput;
};
export type SeasonUserUncheckedCreateWithoutPlayerPicksInput = {
    id?: string;
    seasonId: number;
    userId: number;
    teamName: string;
    finalRank?: number | null;
    totalPoints?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    scores?: Prisma.ScoreUncheckedCreateNestedManyWithoutSeasonUserInput;
    chipPlays?: Prisma.ChipPlayUncheckedCreateNestedManyWithoutSeasonUserInput;
};
export type SeasonUserCreateOrConnectWithoutPlayerPicksInput = {
    where: Prisma.SeasonUserWhereUniqueInput;
    create: Prisma.XOR<Prisma.SeasonUserCreateWithoutPlayerPicksInput, Prisma.SeasonUserUncheckedCreateWithoutPlayerPicksInput>;
};
export type SeasonUserUpsertWithoutPlayerPicksInput = {
    update: Prisma.XOR<Prisma.SeasonUserUpdateWithoutPlayerPicksInput, Prisma.SeasonUserUncheckedUpdateWithoutPlayerPicksInput>;
    create: Prisma.XOR<Prisma.SeasonUserCreateWithoutPlayerPicksInput, Prisma.SeasonUserUncheckedCreateWithoutPlayerPicksInput>;
    where?: Prisma.SeasonUserWhereInput;
};
export type SeasonUserUpdateToOneWithWhereWithoutPlayerPicksInput = {
    where?: Prisma.SeasonUserWhereInput;
    data: Prisma.XOR<Prisma.SeasonUserUpdateWithoutPlayerPicksInput, Prisma.SeasonUserUncheckedUpdateWithoutPlayerPicksInput>;
};
export type SeasonUserUpdateWithoutPlayerPicksInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    teamName?: Prisma.StringFieldUpdateOperationsInput | string;
    finalRank?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    season?: Prisma.SeasonUpdateOneRequiredWithoutSeasonUsersNestedInput;
    user?: Prisma.UserUpdateOneRequiredWithoutSeasonsPlayedNestedInput;
    scores?: Prisma.ScoreUpdateManyWithoutSeasonUserNestedInput;
    chipPlays?: Prisma.ChipPlayUpdateManyWithoutSeasonUserNestedInput;
};
export type SeasonUserUncheckedUpdateWithoutPlayerPicksInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    seasonId?: Prisma.IntFieldUpdateOperationsInput | number;
    userId?: Prisma.IntFieldUpdateOperationsInput | number;
    teamName?: Prisma.StringFieldUpdateOperationsInput | string;
    finalRank?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scores?: Prisma.ScoreUncheckedUpdateManyWithoutSeasonUserNestedInput;
    chipPlays?: Prisma.ChipPlayUncheckedUpdateManyWithoutSeasonUserNestedInput;
};
export type SeasonUserCreateManyUserInput = {
    id?: string;
    seasonId: number;
    teamName: string;
    finalRank?: number | null;
    totalPoints?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type SeasonUserUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    teamName?: Prisma.StringFieldUpdateOperationsInput | string;
    finalRank?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    season?: Prisma.SeasonUpdateOneRequiredWithoutSeasonUsersNestedInput;
    scores?: Prisma.ScoreUpdateManyWithoutSeasonUserNestedInput;
    chipPlays?: Prisma.ChipPlayUpdateManyWithoutSeasonUserNestedInput;
    playerPicks?: Prisma.PlayerPickUpdateManyWithoutSeasonUserNestedInput;
};
export type SeasonUserUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    seasonId?: Prisma.IntFieldUpdateOperationsInput | number;
    teamName?: Prisma.StringFieldUpdateOperationsInput | string;
    finalRank?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scores?: Prisma.ScoreUncheckedUpdateManyWithoutSeasonUserNestedInput;
    chipPlays?: Prisma.ChipPlayUncheckedUpdateManyWithoutSeasonUserNestedInput;
    playerPicks?: Prisma.PlayerPickUncheckedUpdateManyWithoutSeasonUserNestedInput;
};
export type SeasonUserUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    seasonId?: Prisma.IntFieldUpdateOperationsInput | number;
    teamName?: Prisma.StringFieldUpdateOperationsInput | string;
    finalRank?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SeasonUserCreateManySeasonInput = {
    id?: string;
    userId: number;
    teamName: string;
    finalRank?: number | null;
    totalPoints?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type SeasonUserUpdateWithoutSeasonInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    teamName?: Prisma.StringFieldUpdateOperationsInput | string;
    finalRank?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutSeasonsPlayedNestedInput;
    scores?: Prisma.ScoreUpdateManyWithoutSeasonUserNestedInput;
    chipPlays?: Prisma.ChipPlayUpdateManyWithoutSeasonUserNestedInput;
    playerPicks?: Prisma.PlayerPickUpdateManyWithoutSeasonUserNestedInput;
};
export type SeasonUserUncheckedUpdateWithoutSeasonInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.IntFieldUpdateOperationsInput | number;
    teamName?: Prisma.StringFieldUpdateOperationsInput | string;
    finalRank?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scores?: Prisma.ScoreUncheckedUpdateManyWithoutSeasonUserNestedInput;
    chipPlays?: Prisma.ChipPlayUncheckedUpdateManyWithoutSeasonUserNestedInput;
    playerPicks?: Prisma.PlayerPickUncheckedUpdateManyWithoutSeasonUserNestedInput;
};
export type SeasonUserUncheckedUpdateManyWithoutSeasonInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.IntFieldUpdateOperationsInput | number;
    teamName?: Prisma.StringFieldUpdateOperationsInput | string;
    finalRank?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    totalPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type SeasonUserCountOutputType
 */
export type SeasonUserCountOutputType = {
    scores: number;
    chipPlays: number;
    playerPicks: number;
};
export type SeasonUserCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    scores?: boolean | SeasonUserCountOutputTypeCountScoresArgs;
    chipPlays?: boolean | SeasonUserCountOutputTypeCountChipPlaysArgs;
    playerPicks?: boolean | SeasonUserCountOutputTypeCountPlayerPicksArgs;
};
/**
 * SeasonUserCountOutputType without action
 */
export type SeasonUserCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SeasonUserCountOutputType
     */
    select?: Prisma.SeasonUserCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * SeasonUserCountOutputType without action
 */
export type SeasonUserCountOutputTypeCountScoresArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ScoreWhereInput;
};
/**
 * SeasonUserCountOutputType without action
 */
export type SeasonUserCountOutputTypeCountChipPlaysArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ChipPlayWhereInput;
};
/**
 * SeasonUserCountOutputType without action
 */
export type SeasonUserCountOutputTypeCountPlayerPicksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PlayerPickWhereInput;
};
export type SeasonUserSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    seasonId?: boolean;
    userId?: boolean;
    teamName?: boolean;
    finalRank?: boolean;
    totalPoints?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    season?: boolean | Prisma.SeasonDefaultArgs<ExtArgs>;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    scores?: boolean | Prisma.SeasonUser$scoresArgs<ExtArgs>;
    chipPlays?: boolean | Prisma.SeasonUser$chipPlaysArgs<ExtArgs>;
    playerPicks?: boolean | Prisma.SeasonUser$playerPicksArgs<ExtArgs>;
    _count?: boolean | Prisma.SeasonUserCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["seasonUser"]>;
export type SeasonUserSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    seasonId?: boolean;
    userId?: boolean;
    teamName?: boolean;
    finalRank?: boolean;
    totalPoints?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    season?: boolean | Prisma.SeasonDefaultArgs<ExtArgs>;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["seasonUser"]>;
export type SeasonUserSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    seasonId?: boolean;
    userId?: boolean;
    teamName?: boolean;
    finalRank?: boolean;
    totalPoints?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    season?: boolean | Prisma.SeasonDefaultArgs<ExtArgs>;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["seasonUser"]>;
export type SeasonUserSelectScalar = {
    id?: boolean;
    seasonId?: boolean;
    userId?: boolean;
    teamName?: boolean;
    finalRank?: boolean;
    totalPoints?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type SeasonUserOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "seasonId" | "userId" | "teamName" | "finalRank" | "totalPoints" | "createdAt" | "updatedAt", ExtArgs["result"]["seasonUser"]>;
export type SeasonUserInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    season?: boolean | Prisma.SeasonDefaultArgs<ExtArgs>;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    scores?: boolean | Prisma.SeasonUser$scoresArgs<ExtArgs>;
    chipPlays?: boolean | Prisma.SeasonUser$chipPlaysArgs<ExtArgs>;
    playerPicks?: boolean | Prisma.SeasonUser$playerPicksArgs<ExtArgs>;
    _count?: boolean | Prisma.SeasonUserCountOutputTypeDefaultArgs<ExtArgs>;
};
export type SeasonUserIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    season?: boolean | Prisma.SeasonDefaultArgs<ExtArgs>;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type SeasonUserIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    season?: boolean | Prisma.SeasonDefaultArgs<ExtArgs>;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $SeasonUserPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "SeasonUser";
    objects: {
        season: Prisma.$SeasonPayload<ExtArgs>;
        user: Prisma.$UserPayload<ExtArgs>;
        scores: Prisma.$ScorePayload<ExtArgs>[];
        chipPlays: Prisma.$ChipPlayPayload<ExtArgs>[];
        playerPicks: Prisma.$PlayerPickPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        seasonId: number;
        userId: number;
        teamName: string;
        finalRank: number | null;
        totalPoints: number;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["seasonUser"]>;
    composites: {};
};
export type SeasonUserGetPayload<S extends boolean | null | undefined | SeasonUserDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$SeasonUserPayload, S>;
export type SeasonUserCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<SeasonUserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: SeasonUserCountAggregateInputType | true;
};
export interface SeasonUserDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['SeasonUser'];
        meta: {
            name: 'SeasonUser';
        };
    };
    /**
     * Find zero or one SeasonUser that matches the filter.
     * @param {SeasonUserFindUniqueArgs} args - Arguments to find a SeasonUser
     * @example
     * // Get one SeasonUser
     * const seasonUser = await prisma.seasonUser.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SeasonUserFindUniqueArgs>(args: Prisma.SelectSubset<T, SeasonUserFindUniqueArgs<ExtArgs>>): Prisma.Prisma__SeasonUserClient<runtime.Types.Result.GetResult<Prisma.$SeasonUserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one SeasonUser that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SeasonUserFindUniqueOrThrowArgs} args - Arguments to find a SeasonUser
     * @example
     * // Get one SeasonUser
     * const seasonUser = await prisma.seasonUser.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SeasonUserFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, SeasonUserFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__SeasonUserClient<runtime.Types.Result.GetResult<Prisma.$SeasonUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first SeasonUser that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SeasonUserFindFirstArgs} args - Arguments to find a SeasonUser
     * @example
     * // Get one SeasonUser
     * const seasonUser = await prisma.seasonUser.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SeasonUserFindFirstArgs>(args?: Prisma.SelectSubset<T, SeasonUserFindFirstArgs<ExtArgs>>): Prisma.Prisma__SeasonUserClient<runtime.Types.Result.GetResult<Prisma.$SeasonUserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first SeasonUser that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SeasonUserFindFirstOrThrowArgs} args - Arguments to find a SeasonUser
     * @example
     * // Get one SeasonUser
     * const seasonUser = await prisma.seasonUser.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SeasonUserFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, SeasonUserFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__SeasonUserClient<runtime.Types.Result.GetResult<Prisma.$SeasonUserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more SeasonUsers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SeasonUserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SeasonUsers
     * const seasonUsers = await prisma.seasonUser.findMany()
     *
     * // Get first 10 SeasonUsers
     * const seasonUsers = await prisma.seasonUser.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const seasonUserWithIdOnly = await prisma.seasonUser.findMany({ select: { id: true } })
     *
     */
    findMany<T extends SeasonUserFindManyArgs>(args?: Prisma.SelectSubset<T, SeasonUserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SeasonUserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a SeasonUser.
     * @param {SeasonUserCreateArgs} args - Arguments to create a SeasonUser.
     * @example
     * // Create one SeasonUser
     * const SeasonUser = await prisma.seasonUser.create({
     *   data: {
     *     // ... data to create a SeasonUser
     *   }
     * })
     *
     */
    create<T extends SeasonUserCreateArgs>(args: Prisma.SelectSubset<T, SeasonUserCreateArgs<ExtArgs>>): Prisma.Prisma__SeasonUserClient<runtime.Types.Result.GetResult<Prisma.$SeasonUserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many SeasonUsers.
     * @param {SeasonUserCreateManyArgs} args - Arguments to create many SeasonUsers.
     * @example
     * // Create many SeasonUsers
     * const seasonUser = await prisma.seasonUser.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends SeasonUserCreateManyArgs>(args?: Prisma.SelectSubset<T, SeasonUserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many SeasonUsers and returns the data saved in the database.
     * @param {SeasonUserCreateManyAndReturnArgs} args - Arguments to create many SeasonUsers.
     * @example
     * // Create many SeasonUsers
     * const seasonUser = await prisma.seasonUser.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many SeasonUsers and only return the `id`
     * const seasonUserWithIdOnly = await prisma.seasonUser.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends SeasonUserCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, SeasonUserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SeasonUserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a SeasonUser.
     * @param {SeasonUserDeleteArgs} args - Arguments to delete one SeasonUser.
     * @example
     * // Delete one SeasonUser
     * const SeasonUser = await prisma.seasonUser.delete({
     *   where: {
     *     // ... filter to delete one SeasonUser
     *   }
     * })
     *
     */
    delete<T extends SeasonUserDeleteArgs>(args: Prisma.SelectSubset<T, SeasonUserDeleteArgs<ExtArgs>>): Prisma.Prisma__SeasonUserClient<runtime.Types.Result.GetResult<Prisma.$SeasonUserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one SeasonUser.
     * @param {SeasonUserUpdateArgs} args - Arguments to update one SeasonUser.
     * @example
     * // Update one SeasonUser
     * const seasonUser = await prisma.seasonUser.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends SeasonUserUpdateArgs>(args: Prisma.SelectSubset<T, SeasonUserUpdateArgs<ExtArgs>>): Prisma.Prisma__SeasonUserClient<runtime.Types.Result.GetResult<Prisma.$SeasonUserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more SeasonUsers.
     * @param {SeasonUserDeleteManyArgs} args - Arguments to filter SeasonUsers to delete.
     * @example
     * // Delete a few SeasonUsers
     * const { count } = await prisma.seasonUser.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends SeasonUserDeleteManyArgs>(args?: Prisma.SelectSubset<T, SeasonUserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more SeasonUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SeasonUserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SeasonUsers
     * const seasonUser = await prisma.seasonUser.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends SeasonUserUpdateManyArgs>(args: Prisma.SelectSubset<T, SeasonUserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more SeasonUsers and returns the data updated in the database.
     * @param {SeasonUserUpdateManyAndReturnArgs} args - Arguments to update many SeasonUsers.
     * @example
     * // Update many SeasonUsers
     * const seasonUser = await prisma.seasonUser.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more SeasonUsers and only return the `id`
     * const seasonUserWithIdOnly = await prisma.seasonUser.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends SeasonUserUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, SeasonUserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SeasonUserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one SeasonUser.
     * @param {SeasonUserUpsertArgs} args - Arguments to update or create a SeasonUser.
     * @example
     * // Update or create a SeasonUser
     * const seasonUser = await prisma.seasonUser.upsert({
     *   create: {
     *     // ... data to create a SeasonUser
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SeasonUser we want to update
     *   }
     * })
     */
    upsert<T extends SeasonUserUpsertArgs>(args: Prisma.SelectSubset<T, SeasonUserUpsertArgs<ExtArgs>>): Prisma.Prisma__SeasonUserClient<runtime.Types.Result.GetResult<Prisma.$SeasonUserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of SeasonUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SeasonUserCountArgs} args - Arguments to filter SeasonUsers to count.
     * @example
     * // Count the number of SeasonUsers
     * const count = await prisma.seasonUser.count({
     *   where: {
     *     // ... the filter for the SeasonUsers we want to count
     *   }
     * })
    **/
    count<T extends SeasonUserCountArgs>(args?: Prisma.Subset<T, SeasonUserCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], SeasonUserCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a SeasonUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SeasonUserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SeasonUserAggregateArgs>(args: Prisma.Subset<T, SeasonUserAggregateArgs>): Prisma.PrismaPromise<GetSeasonUserAggregateType<T>>;
    /**
     * Group by SeasonUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SeasonUserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends SeasonUserGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: SeasonUserGroupByArgs['orderBy'];
    } : {
        orderBy?: SeasonUserGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, SeasonUserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSeasonUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the SeasonUser model
     */
    readonly fields: SeasonUserFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for SeasonUser.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__SeasonUserClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    season<T extends Prisma.SeasonDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.SeasonDefaultArgs<ExtArgs>>): Prisma.Prisma__SeasonClient<runtime.Types.Result.GetResult<Prisma.$SeasonPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    scores<T extends Prisma.SeasonUser$scoresArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.SeasonUser$scoresArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScorePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    chipPlays<T extends Prisma.SeasonUser$chipPlaysArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.SeasonUser$chipPlaysArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ChipPlayPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    playerPicks<T extends Prisma.SeasonUser$playerPicksArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.SeasonUser$playerPicksArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PlayerPickPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the SeasonUser model
 */
export interface SeasonUserFieldRefs {
    readonly id: Prisma.FieldRef<"SeasonUser", 'String'>;
    readonly seasonId: Prisma.FieldRef<"SeasonUser", 'Int'>;
    readonly userId: Prisma.FieldRef<"SeasonUser", 'Int'>;
    readonly teamName: Prisma.FieldRef<"SeasonUser", 'String'>;
    readonly finalRank: Prisma.FieldRef<"SeasonUser", 'Int'>;
    readonly totalPoints: Prisma.FieldRef<"SeasonUser", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"SeasonUser", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"SeasonUser", 'DateTime'>;
}
/**
 * SeasonUser findUnique
 */
export type SeasonUserFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SeasonUser
     */
    select?: Prisma.SeasonUserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SeasonUser
     */
    omit?: Prisma.SeasonUserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SeasonUserInclude<ExtArgs> | null;
    /**
     * Filter, which SeasonUser to fetch.
     */
    where: Prisma.SeasonUserWhereUniqueInput;
};
/**
 * SeasonUser findUniqueOrThrow
 */
export type SeasonUserFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SeasonUser
     */
    select?: Prisma.SeasonUserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SeasonUser
     */
    omit?: Prisma.SeasonUserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SeasonUserInclude<ExtArgs> | null;
    /**
     * Filter, which SeasonUser to fetch.
     */
    where: Prisma.SeasonUserWhereUniqueInput;
};
/**
 * SeasonUser findFirst
 */
export type SeasonUserFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SeasonUser
     */
    select?: Prisma.SeasonUserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SeasonUser
     */
    omit?: Prisma.SeasonUserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SeasonUserInclude<ExtArgs> | null;
    /**
     * Filter, which SeasonUser to fetch.
     */
    where?: Prisma.SeasonUserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of SeasonUsers to fetch.
     */
    orderBy?: Prisma.SeasonUserOrderByWithRelationInput | Prisma.SeasonUserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for SeasonUsers.
     */
    cursor?: Prisma.SeasonUserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` SeasonUsers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` SeasonUsers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of SeasonUsers.
     */
    distinct?: Prisma.SeasonUserScalarFieldEnum | Prisma.SeasonUserScalarFieldEnum[];
};
/**
 * SeasonUser findFirstOrThrow
 */
export type SeasonUserFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SeasonUser
     */
    select?: Prisma.SeasonUserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SeasonUser
     */
    omit?: Prisma.SeasonUserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SeasonUserInclude<ExtArgs> | null;
    /**
     * Filter, which SeasonUser to fetch.
     */
    where?: Prisma.SeasonUserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of SeasonUsers to fetch.
     */
    orderBy?: Prisma.SeasonUserOrderByWithRelationInput | Prisma.SeasonUserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for SeasonUsers.
     */
    cursor?: Prisma.SeasonUserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` SeasonUsers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` SeasonUsers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of SeasonUsers.
     */
    distinct?: Prisma.SeasonUserScalarFieldEnum | Prisma.SeasonUserScalarFieldEnum[];
};
/**
 * SeasonUser findMany
 */
export type SeasonUserFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SeasonUser
     */
    select?: Prisma.SeasonUserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SeasonUser
     */
    omit?: Prisma.SeasonUserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SeasonUserInclude<ExtArgs> | null;
    /**
     * Filter, which SeasonUsers to fetch.
     */
    where?: Prisma.SeasonUserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of SeasonUsers to fetch.
     */
    orderBy?: Prisma.SeasonUserOrderByWithRelationInput | Prisma.SeasonUserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing SeasonUsers.
     */
    cursor?: Prisma.SeasonUserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` SeasonUsers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` SeasonUsers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of SeasonUsers.
     */
    distinct?: Prisma.SeasonUserScalarFieldEnum | Prisma.SeasonUserScalarFieldEnum[];
};
/**
 * SeasonUser create
 */
export type SeasonUserCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SeasonUser
     */
    select?: Prisma.SeasonUserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SeasonUser
     */
    omit?: Prisma.SeasonUserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SeasonUserInclude<ExtArgs> | null;
    /**
     * The data needed to create a SeasonUser.
     */
    data: Prisma.XOR<Prisma.SeasonUserCreateInput, Prisma.SeasonUserUncheckedCreateInput>;
};
/**
 * SeasonUser createMany
 */
export type SeasonUserCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many SeasonUsers.
     */
    data: Prisma.SeasonUserCreateManyInput | Prisma.SeasonUserCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * SeasonUser createManyAndReturn
 */
export type SeasonUserCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SeasonUser
     */
    select?: Prisma.SeasonUserSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the SeasonUser
     */
    omit?: Prisma.SeasonUserOmit<ExtArgs> | null;
    /**
     * The data used to create many SeasonUsers.
     */
    data: Prisma.SeasonUserCreateManyInput | Prisma.SeasonUserCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SeasonUserIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * SeasonUser update
 */
export type SeasonUserUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SeasonUser
     */
    select?: Prisma.SeasonUserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SeasonUser
     */
    omit?: Prisma.SeasonUserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SeasonUserInclude<ExtArgs> | null;
    /**
     * The data needed to update a SeasonUser.
     */
    data: Prisma.XOR<Prisma.SeasonUserUpdateInput, Prisma.SeasonUserUncheckedUpdateInput>;
    /**
     * Choose, which SeasonUser to update.
     */
    where: Prisma.SeasonUserWhereUniqueInput;
};
/**
 * SeasonUser updateMany
 */
export type SeasonUserUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update SeasonUsers.
     */
    data: Prisma.XOR<Prisma.SeasonUserUpdateManyMutationInput, Prisma.SeasonUserUncheckedUpdateManyInput>;
    /**
     * Filter which SeasonUsers to update
     */
    where?: Prisma.SeasonUserWhereInput;
    /**
     * Limit how many SeasonUsers to update.
     */
    limit?: number;
};
/**
 * SeasonUser updateManyAndReturn
 */
export type SeasonUserUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SeasonUser
     */
    select?: Prisma.SeasonUserSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the SeasonUser
     */
    omit?: Prisma.SeasonUserOmit<ExtArgs> | null;
    /**
     * The data used to update SeasonUsers.
     */
    data: Prisma.XOR<Prisma.SeasonUserUpdateManyMutationInput, Prisma.SeasonUserUncheckedUpdateManyInput>;
    /**
     * Filter which SeasonUsers to update
     */
    where?: Prisma.SeasonUserWhereInput;
    /**
     * Limit how many SeasonUsers to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SeasonUserIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * SeasonUser upsert
 */
export type SeasonUserUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SeasonUser
     */
    select?: Prisma.SeasonUserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SeasonUser
     */
    omit?: Prisma.SeasonUserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SeasonUserInclude<ExtArgs> | null;
    /**
     * The filter to search for the SeasonUser to update in case it exists.
     */
    where: Prisma.SeasonUserWhereUniqueInput;
    /**
     * In case the SeasonUser found by the `where` argument doesn't exist, create a new SeasonUser with this data.
     */
    create: Prisma.XOR<Prisma.SeasonUserCreateInput, Prisma.SeasonUserUncheckedCreateInput>;
    /**
     * In case the SeasonUser was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.SeasonUserUpdateInput, Prisma.SeasonUserUncheckedUpdateInput>;
};
/**
 * SeasonUser delete
 */
export type SeasonUserDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SeasonUser
     */
    select?: Prisma.SeasonUserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SeasonUser
     */
    omit?: Prisma.SeasonUserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SeasonUserInclude<ExtArgs> | null;
    /**
     * Filter which SeasonUser to delete.
     */
    where: Prisma.SeasonUserWhereUniqueInput;
};
/**
 * SeasonUser deleteMany
 */
export type SeasonUserDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which SeasonUsers to delete
     */
    where?: Prisma.SeasonUserWhereInput;
    /**
     * Limit how many SeasonUsers to delete.
     */
    limit?: number;
};
/**
 * SeasonUser.scores
 */
export type SeasonUser$scoresArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Score
     */
    select?: Prisma.ScoreSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Score
     */
    omit?: Prisma.ScoreOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScoreInclude<ExtArgs> | null;
    where?: Prisma.ScoreWhereInput;
    orderBy?: Prisma.ScoreOrderByWithRelationInput | Prisma.ScoreOrderByWithRelationInput[];
    cursor?: Prisma.ScoreWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ScoreScalarFieldEnum | Prisma.ScoreScalarFieldEnum[];
};
/**
 * SeasonUser.chipPlays
 */
export type SeasonUser$chipPlaysArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChipPlay
     */
    select?: Prisma.ChipPlaySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ChipPlay
     */
    omit?: Prisma.ChipPlayOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ChipPlayInclude<ExtArgs> | null;
    where?: Prisma.ChipPlayWhereInput;
    orderBy?: Prisma.ChipPlayOrderByWithRelationInput | Prisma.ChipPlayOrderByWithRelationInput[];
    cursor?: Prisma.ChipPlayWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ChipPlayScalarFieldEnum | Prisma.ChipPlayScalarFieldEnum[];
};
/**
 * SeasonUser.playerPicks
 */
export type SeasonUser$playerPicksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlayerPick
     */
    select?: Prisma.PlayerPickSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PlayerPick
     */
    omit?: Prisma.PlayerPickOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlayerPickInclude<ExtArgs> | null;
    where?: Prisma.PlayerPickWhereInput;
    orderBy?: Prisma.PlayerPickOrderByWithRelationInput | Prisma.PlayerPickOrderByWithRelationInput[];
    cursor?: Prisma.PlayerPickWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PlayerPickScalarFieldEnum | Prisma.PlayerPickScalarFieldEnum[];
};
/**
 * SeasonUser without action
 */
export type SeasonUserDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SeasonUser
     */
    select?: Prisma.SeasonUserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SeasonUser
     */
    omit?: Prisma.SeasonUserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SeasonUserInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=SeasonUser.d.ts.map